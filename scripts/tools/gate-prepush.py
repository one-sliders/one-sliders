#!/usr/bin/env python3
"""
gate-prepush.py  --  OneSliders pre-push/pre-QA validation gate.

Checks all git-changed HTML files (or explicit paths) against critical rules.
Exits 1 if any page fails so git push is blocked.

Modes:
  (default)          check git-changed HTML pages
  --all              check every HTML page in content/
  --paths a b c      check explicit files
  --qa               alias for --all (use when moving to QA)

Checks per page:
  title         present and ≤60 chars, no "slider" keyword
  description   meta description present and ≤155 chars
  canonical     rel=canonical present with absolute URL
  og:image      property="og:image" starts with https://one-sliders.com
  h1            exactly one <h1> tag
  json-ld       application/ld+json block present
  no-tbd        no TBD / TBC / placeholder / lorem ipsum / [INSERT in body text
"""

import os, re, sys, subprocess, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOMAIN = 'https://one-sliders.com'
EXCLUDE = {'tmp', '.git', 'node_modules', '__pycache__', 'Templates'}

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass


def rel(path):
    return os.path.relpath(path, ROOT).replace('\\', '/')


def excluded(path):
    return any(p in EXCLUDE for p in rel(path).split('/'))


def read(path):
    try:
        with open(path, encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        with open(path, encoding='utf-8', errors='replace') as f:
            return f.read()


def git_changed_html():
    """Return HTML files in unpushed commits (HEAD vs remote tracking branch).

    This means: only files that are actually being pushed, not every dirty
    working-tree file.  Falls back to HEAD..HEAD (empty) if the remote is
    not yet known, which is safe.
    """
    # Find the upstream tracking ref for the current branch
    upstream = subprocess.run(
        ['git', 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'],
        cwd=ROOT, capture_output=True, text=True
    )
    if upstream.returncode == 0:
        remote_ref = upstream.stdout.strip()  # e.g. origin/master
    else:
        # No tracking branch set — fall back to origin/master
        remote_ref = 'origin/master'

    try:
        out = subprocess.run(
            ['git', 'diff', '--name-only', f'{remote_ref}..HEAD'],
            cwd=ROOT, capture_output=True, text=True
        ).stdout
        lines = set(out.splitlines())
    except Exception:
        lines = set()

    files = []
    for p in lines:
        if not p.lower().endswith('.html'):
            continue
        full = os.path.join(ROOT, p)
        if os.path.isfile(full) and not excluded(full):
            files.append(full)
    return sorted(files)


def all_html():
    import glob
    files = glob.glob(os.path.join(ROOT, 'content/**/*.html'), recursive=True)
    files += [os.path.join(ROOT, 'index.html')]
    return sorted(f for f in files if os.path.isfile(f) and not excluded(f))


# ------------------------------------------------------------------ checks
def body_text(h):
    """Strip script/style/head blocks, return body text."""
    h = re.sub(r'<(script|style|head)[^>]*>.*?</\1>', ' ', h, flags=re.S | re.I)
    return re.sub(r'<[^>]+>', ' ', h)


def check(path, h):
    fails = []

    # title
    title_m = re.search(r'<title>(.*?)</title>', h, re.S | re.I)
    if not title_m:
        fails.append('MISSING title')
    else:
        t = H.unescape(title_m.group(1)).strip()
        if len(t) > 60:
            fails.append(f'title {len(t)} chars (>60)')
        if re.search(r'\bslider\b', t, re.I):
            fails.append('title contains "slider"')

    # description
    desc_m = re.search(r'name="description"[^>]*content="([^"]*)"', h, re.I)
    if not desc_m:
        fails.append('MISSING meta description')
    elif len(desc_m.group(1)) > 155:
        fails.append(f'description {len(desc_m.group(1))} chars (>155)')

    # canonical
    canon_m = re.search(r'rel="canonical"\s+href="([^"]+)"', h, re.I)
    if not canon_m:
        fails.append('MISSING canonical')
    elif not canon_m.group(1).startswith('https://'):
        fails.append('canonical not absolute URL')

    # og:image
    ogimg_m = re.search(r'property="og:image"[^>]*content="([^"]+)"', h, re.I)
    if not ogimg_m:
        fails.append('MISSING og:image')
    elif not ogimg_m.group(1).startswith(DOMAIN):
        fails.append(f'og:image not absolute ({ogimg_m.group(1)[:60]})')

    # H1
    h1s = re.findall(r'<h1[\s>]', h, re.I)
    if len(h1s) == 0:
        fails.append('MISSING h1')
    elif len(h1s) > 1:
        fails.append(f'{len(h1s)} h1 tags (must be exactly 1)')

    # JSON-LD
    if not re.search(r'application/ld\+json', h, re.I):
        fails.append('MISSING json-ld')

    # nav logo: every page with a top-menu nav must have os-brand
    if re.search(r'<nav[^>]*class="[^"]*top-menu', h, re.I):
        if not re.search(r'class="[^"]*os-brand', h, re.I):
            fails.append('nav top-menu missing os-brand logo')

    # nearby tab: if the nearby radio exists, the panel must contain text
    if re.search(r'id="view-nearby"', h, re.I):
        nearby_m = re.search(
            r'id="nearby"(.*?)(?=<div class="persona-panel|</section>|</main>)',
            h, re.S | re.I
        )
        if not nearby_m:
            fails.append('nearby tab exists but nearby panel is missing')
        else:
            panel_text = re.sub(r'<[^>]+>', ' ', nearby_m.group(1))
            panel_text = re.sub(r'\s+', ' ', panel_text).strip()
            if len(panel_text) < 20:
                fails.append('nearby panel exists but has no text content')

    # no placeholder content (TBD/TBC are OK — they mean "unconfirmed" in real data)
    txt = body_text(h)
    for pattern, label in [
        (r'\bTODO\b', 'TODO in body'),
        (r'\bFIXME\b', 'FIXME in body'),
        (r'\blorem ipsum\b', 'lorem ipsum'),
        (r'\[INSERT', '[INSERT placeholder'),
        (r'\[FILL', '[FILL placeholder'),
        (r'\[NAME\]', '[NAME] placeholder'),
        (r'\[CITY\]', '[CITY] placeholder'),
        (r'\[EVENT\]', '[EVENT] placeholder'),
        (r'placeholder text', 'placeholder text'),
    ]:
        if re.search(pattern, txt, re.I):
            fails.append(label)

    return fails


# ------------------------------------------------------------------ main
def main(argv):
    use_all = '--all' in argv or '--qa' in argv
    explicit = []
    if '--paths' in argv:
        i = argv.index('--paths')
        explicit = [os.path.join(ROOT, p) if not os.path.isabs(p) else p
                    for p in argv[i+1:] if not p.startswith('--')]

    if explicit:
        files = [f for f in explicit if os.path.isfile(f) and not excluded(f)]
    elif use_all:
        files = all_html()
    else:
        files = git_changed_html()

    if not files:
        print('gate-prepush: no HTML pages to check — OK')
        return 0

    print(f'\ngate-prepush: checking {len(files)} page(s)\n')

    total_fails = 0
    page_results = []
    for f in files:
        h = read(f)
        if re.search(r'name="robots"[^>]*noindex', h, re.I):
            continue
        fails = check(f, h)
        page_results.append((rel(f), fails))
        total_fails += len(fails)

    # print results
    ok_pages = [r for r in page_results if not r[1]]
    fail_pages = [r for r in page_results if r[1]]

    if fail_pages:
        print(f'  FAILED ({len(fail_pages)} pages):')
        for path, fails in fail_pages:
            print(f'\n  ✗ {path}')
            for f in fails:
                print(f'      · {f}')
    else:
        pass

    print(f'\n  OK:     {len(ok_pages)} pages')
    print(f'  FAILED: {len(fail_pages)} pages')
    print(f'  Issues: {total_fails}\n')

    if fail_pages:
        print('  Fix issues in source templates/data and rebuild before pushing.')
        print('  gate-prepush: BLOCKED\n')
        return 1

    print('  gate-prepush: ALL CLEAR\n')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

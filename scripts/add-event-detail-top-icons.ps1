$ErrorActionPreference = 'Stop'

$iconCss = '.nav-icon{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;color:var(--muted);text-decoration:none;transition:background .12s,color .12s}.nav-icon:hover{background:var(--theme);color:white}.nav-icon svg{width:22px;height:22px;display:block}.nav-divider{width:1px;height:18px;background:var(--line);flex:0 0 auto;align-self:center}'

$icons = '<a class="nav-icon" href="../../index.html" title="Events 2026" aria-label="Events 2026"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a><a class="nav-icon" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a><a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a><span class="nav-divider"></span>'

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $html = [IO.File]::ReadAllText($file.FullName)
  $next = $html

  if ($next -notmatch '\.nav-icon\{') {
    $next = $next.Replace('</style>', $iconCss + '</style>')
  }

  if ($next -notmatch 'class="nav-icon" href="../../index.html"') {
    $next = $next.Replace('<nav class="top-menu" aria-label="Event navigation">', '<nav class="top-menu" aria-label="Event navigation">' + $icons)
  }

  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"event_detail_top_icons_updated=$updated"

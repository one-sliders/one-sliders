$base = "C:\Users\AndersEriksson\3DF\OneSlider"

$calSVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
$globeSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
$gridSVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>'

function Fix-Nav($filePath, $evIdx, $siteRoot, $pillHtml) {
  $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

  $locUrl  = $siteRoot + "locations/index.html"
  $catUrl  = $siteRoot + "categories/index.html"

  $iconEv  = '<a class="nav-icon" href="' + $evIdx + '" title="Events" aria-label="Events">' + $calSVG + '</a>'
  $iconWo  = '<a class="nav-icon" href="' + $locUrl + '" title="World" aria-label="World">' + $globeSVG + '</a>'
  $iconCat = '<a class="nav-icon" href="' + $catUrl + '" title="Categories" aria-label="Categories">' + $gridSVG + '</a>'
  $divider = '<span class="nav-divider"></span>'

  # Extract existing breadcrumbs after divider (strip old nav-pill)
  $existingNav = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value
  $breadcrumbs = ""
  $divIdx = $existingNav.IndexOf('<span class="nav-divider">')
  if ($divIdx -ge 0) {
    $after = $existingNav.Substring($divIdx + '<span class="nav-divider"></span>'.Length).Trim()
    $after = [regex]::Replace($after, '<a class="nav-pill"[^>]*>[^<]*</a>', '').Trim()
    $breadcrumbs = $after
  }

  $inner   = $iconEv + $iconWo + $iconCat + $divider + $pillHtml
  if ($breadcrumbs) { $inner += $breadcrumbs }

  $newHtml = [regex]::Replace($html,
    '(?s)(<nav\b[^>]*class="top-menu"[^>]*>)([\s\S]*?)(</nav>)',
    { param($m) $m.Groups[1].Value + $inner + $m.Groups[3].Value })

  if ($newHtml -ne $html) {
    [System.IO.File]::WriteAllText($filePath, $newHtml, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed: " + [System.IO.Path]::GetFileName($filePath)
  } else {
    Write-Host "Unchanged: " + [System.IO.Path]::GetFileName($filePath)
  }
}

# siteRoot for content/events/2026/05/ files = ../../../ (3 levels up to content/)
# ── 1. Eurovision sub-pages (music / song-contests) ─────────────────────────
$euroPill = '<a class="nav-pill" href="../../../categories/music/song-contests.html">Song Contests</a>'
foreach ($name in @("eurovision-grand-final.html","eurovision-semi-final-1.html","eurovision-semi-final-2.html")) {
  $path = "$base\content\events\2026\05\$name"
  if (Test-Path $path) {
    Fix-Nav $path "../../index.html" "../../../" $euroPill
  } else { Write-Host "NOT FOUND: $name" }
}

# ── 2. PGA Championship follow-up (sport / golf) ────────────────────────────
$pgaPath = "$base\content\events\2026\05\pga-championship-follow-up.html"
if (Test-Path $pgaPath) {
  $pgaPill = '<a class="nav-pill" href="../../../categories/sport/golf.html">Golf</a>'
  Fix-Nav $pgaPath "../../index.html" "../../../" $pgaPill
} else { Write-Host "NOT FOUND: pga-championship-follow-up.html" }

# ── 3. Octoberfest typo duplicates (sport / motorsport → festival actually) ──
# These seem to be duplicate/typo files of oktoberfest. Add a basic nav.
foreach ($name in @("octoberfest-2026.html","octoberfest.html","oktoberfest-2026.html")) {
  $path = "$base\content\events\2026\09\$name"
  if (Test-Path $path) {
    $pill = '<a class="nav-pill" href="../../../categories/culture/index.html">Culture</a>'
    Fix-Nav $path "../../index.html" "../../../" $pill
  } else { Write-Host "NOT FOUND: $name" }
}

Write-Host "Done."

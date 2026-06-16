# fix-event-nav.ps1
# Ensures all event pages have 3 nav-icons + correct topic/category pill

$base    = "C:\Users\AndersEriksson\3DF\OneSlider"
$idxFile = "$base\content\events\index.html"
$idxHtml = [System.IO.File]::ReadAllText($idxFile, [System.Text.Encoding]::UTF8)

# ── 1. Build slug → [cat, topic] from events index ──────────────────────────
$slugMap = @{}
$cardPat = [regex] '(?s)<a class="event-card"[^>]+href="([^"]+)"[^>]*data-cat="([^"]*)"[^>]*data-topic="([^"]*)"'
foreach ($m in $cardPat.Matches($idxHtml)) {
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($m.Groups[1].Value)
  if ($slug -and -not $slugMap.ContainsKey($slug)) {
    $slugMap[$slug] = @{ cat=$m.Groups[2].Value; topic=$m.Groups[3].Value }
  }
}
# Also handle attribute order variations
$cardPat2 = [regex] '(?s)<a class="event-card"[^>]+data-cat="([^"]*)"[^>]*data-topic="([^"]*)"[^>]+href="([^"]+)"'
foreach ($m in $cardPat2.Matches($idxHtml)) {
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($m.Groups[3].Value)
  if ($slug -and -not $slugMap.ContainsKey($slug)) {
    $slugMap[$slug] = @{ cat=$m.Groups[1].Value; topic=$m.Groups[2].Value }
  }
}
Write-Host "Slug map built: $($slugMap.Count) events"

# ── 2. Map data-cat → filesystem directory under /categories/ ───────────────
# (index uses short names like "motor", disk has "sport")
$catFsDir = @{
  'sport'        = 'sport'
  'motor'        = 'sport'       # F1, MotoGP live under sport/
  'culture'      = 'culture'
  'music'        = 'music'
  'technology'   = 'technology'
  'food-drinks'  = 'food-and-drinks'
  'food'         = 'food-and-drinks'
  'wellness'     = 'wellness'
  'climate'      = 'climate'
}

# ── 3. data-topic → filename in /categories/<dir>/ ──────────────────────────
$topicFile = @{
  'golf'              = 'golf'
  'tennis'            = 'tennis'
  'football'          = 'football'
  'formula-1'         = 'formula-1'
  'formula1'          = 'formula-1'
  'motorsport'        = 'motorsport'
  'motogp'            = 'motorsport'
  'cycling'           = 'cycling'
  'marathon'          = 'marathon'
  'running'           = 'marathon'
  'athletics'         = 'marathon'
  'olympics'          = 'olympics'
  'multi-sport'       = 'olympics'   # multi-sport events → Olympics page
  'basketball'        = 'basketball'
  'baseball'          = 'baseball'
  'ice-hockey'        = 'ice-hockey'
  'cricket'           = 'cricket'
  'rugby'             = 'rugby'
  'rugby-union'       = 'rugby'
  'american-football' = 'american-football'
  'horse-racing'      = 'horse-racing'
  'aussie-rules'      = ''           # no page yet
  'awards'            = 'awards'
  'fashion'           = 'fashion'
  'film'              = 'film'
  'pop-culture'       = 'pop-culture'
  'music-festivals'   = 'music-festivals'
  'song-contests'     = 'song-contests'
  'jazz'              = 'jazz'
  'world-music'       = 'world-music'
  'tech-events'       = 'tech-events'
  'gaming'            = 'gaming'
  'beer'              = 'beer'
  'wine'              = 'wine'
  'coffee'            = 'coffee'
  'street-food'       = 'street-food'
  'food-drink'        = ''           # falls back to category
  'national-day'      = ''
  'religion'          = ''
  'art'               = ''
  'tradition'         = ''
  'winter'            = ''
  'carnival'          = ''
  'wildlife'          = ''
  'new-years'         = ''
}

# ── 4. data-cat → display label ─────────────────────────────────────────────
$catLabel = @{
  'sport'        = 'Sport'
  'motor'        = 'Sport'
  'culture'      = 'Culture'
  'music'        = 'Music'
  'technology'   = 'Technology'
  'food-drinks'  = 'Food & Drinks'
  'food'         = 'Food & Drinks'
  'wellness'     = 'Wellness'
  'climate'      = 'Climate'
}

# ── 5. data-topic → display label ───────────────────────────────────────────
$topicLabel = @{
  'golf'              = 'Golf'
  'tennis'            = 'Tennis'
  'football'          = 'Football'
  'formula-1'         = 'Formula 1'
  'formula1'          = 'Formula 1'
  'motorsport'        = 'Motorsport'
  'motogp'            = 'MotoGP'
  'cycling'           = 'Cycling'
  'marathon'          = 'Marathon'
  'running'           = 'Marathon'
  'athletics'         = 'Athletics'
  'olympics'          = 'Olympics'
  'multi-sport'       = 'Olympics'
  'basketball'        = 'Basketball'
  'baseball'          = 'Baseball'
  'ice-hockey'        = 'Ice Hockey'
  'cricket'           = 'Cricket'
  'rugby'             = 'Rugby'
  'rugby-union'       = 'Rugby'
  'american-football' = 'American Football'
  'horse-racing'      = 'Horse Racing'
  'awards'            = 'Awards'
  'fashion'           = 'Fashion'
  'film'              = 'Film'
  'pop-culture'       = 'Pop Culture'
  'music-festivals'   = 'Music Festivals'
  'song-contests'     = 'Song Contests'
  'jazz'              = 'Jazz'
  'world-music'       = 'World Music'
  'tech-events'       = 'Tech Events'
  'gaming'            = 'Gaming'
  'beer'              = 'Beer'
  'wine'              = 'Wine'
  'coffee'            = 'Coffee'
  'street-food'       = 'Street Food'
}

# ── SVG icons ────────────────────────────────────────────────────────────────
$calSVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
$globeSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
$gridSVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>'

# ── 6. Process every event page ──────────────────────────────────────────────
$eventFiles = Get-ChildItem -Path "$base\content\events" -Recurse -Filter "*.html" |
  Where-Object { $_.Name -ne "index.html" }

$updated = 0; $skipped = 0; $noSlug = 0

foreach ($f in $eventFiles) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)

  # Depth: content\events\YEAR\MONTH\file.html → 4 dirs deep from site root
  $rel   = $f.FullName.Substring($base.Length + 1)
  $depth = $rel.Split('\').Length - 1    # = 4 for standard event pages

  # Relative paths from this file
  $stepsToEvRoot = $depth - 2             # steps from file to content/events/
  $evIdx    = ("../" * $stepsToEvRoot) + "index.html"
  $siteRoot = "../" * ($depth - 1)       # steps from file to content/ (not site root)
  $locUrl   = $siteRoot + "locations/index.html"
  $catUrl   = $siteRoot + "categories/index.html"

  # ── Resolve topic pill ───────────────────────────────────────────────────
  $info = $slugMap[$slug]
  if (-not $info) {
    $baseSlug = [regex]::Replace($slug, '-\d{4}$', '')
    $info = $slugMap[$baseSlug]
  }

  $pillHtml = ""
  if ($info) {
    $cat   = $info.cat
    $topic = $info.topic
    $fsDir = if ($catFsDir.ContainsKey($cat)) { $catFsDir[$cat] } else { $cat }
    $cLbl  = if ($catLabel.ContainsKey($cat))  { $catLabel[$cat]  } else { $cat }
    $catPageUrl = $siteRoot + "categories/" + $fsDir + "/index.html"

    if ($topic -and $topicFile.ContainsKey($topic) -and $topicFile[$topic] -ne '') {
      $tFile = $topicFile[$topic]
      $tLbl  = if ($topicLabel.ContainsKey($topic)) { $topicLabel[$topic] } else { $topic }
      $fullPath = "$base\content\categories\$fsDir\$tFile.html"
      if (Test-Path $fullPath) {
        $pillHtml = '<a class="nav-pill" href="' + $siteRoot + 'categories/' + $fsDir + '/' + $tFile + '.html">' + $tLbl + '</a>'
      } else {
        # Topic page missing → fall back to category index
        $pillHtml = '<a class="nav-pill" href="' + $catPageUrl + '">' + $cLbl + '</a>'
      }
    } elseif ($cat) {
      $pillHtml = '<a class="nav-pill" href="' + $catPageUrl + '">' + $cLbl + '</a>'
    }
  } else {
    $noSlug++
  }

  # ── Build the 3 icons ────────────────────────────────────────────────────
  $iconEv   = '<a class="nav-icon" href="' + $evIdx + '" title="Events" aria-label="Events">' + $calSVG + '</a>'
  $iconWo   = '<a class="nav-icon" href="' + $locUrl + '" title="World" aria-label="World">' + $globeSVG + '</a>'
  $iconCat  = '<a class="nav-icon" href="' + $catUrl + '" title="Categories" aria-label="Categories">' + $gridSVG + '</a>'
  $divider  = '<span class="nav-divider"></span>'

  # ── Extract existing breadcrumbs after divider ───────────────────────────
  $existingNav = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value
  $breadcrumbs = ""
  $divIdx = $existingNav.IndexOf('<span class="nav-divider">')
  if ($divIdx -ge 0) {
    $after = $existingNav.Substring($divIdx + '<span class="nav-divider"></span>'.Length).Trim()
    # Remove any old nav-pill links (we'll add the correct one)
    $after = [regex]::Replace($after, '<a class="nav-pill"[^>]*>[^<]*</a>', '').Trim()
    $breadcrumbs = $after
  }

  # ── Assemble final nav inner HTML ────────────────────────────────────────
  $inner = $iconEv + $iconWo + $iconCat + $divider + $pillHtml
  if ($breadcrumbs -ne "") { $inner += $breadcrumbs }

  # ── Replace <nav> content ────────────────────────────────────────────────
  $before  = $html
  $newHtml = [regex]::Replace($html,
    '(?s)(<nav\b[^>]*class="top-menu"[^>]*>)([\s\S]*?)(</nav>)',
    { param($m) $m.Groups[1].Value + $inner + $m.Groups[3].Value })

  if ($newHtml -ne $before) {
    [System.IO.File]::WriteAllText($f.FullName, $newHtml, [System.Text.Encoding]::UTF8)
    $updated++
  } else {
    $skipped++
  }
}

Write-Host "Updated: $updated  |  Unchanged: $skipped  |  No slug data: $noSlug"
Write-Host "Done."

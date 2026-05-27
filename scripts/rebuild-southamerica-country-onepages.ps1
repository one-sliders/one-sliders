$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceScript = Join-Path $repoRoot 'rebuild-southamerica-countries.ps1'
$sourceText = [System.IO.File]::ReadAllText($sourceScript, [System.Text.Encoding]::UTF8)
$marker = 'function Build-SAPage'
$markerIndex = $sourceText.IndexOf($marker)
if ($markerIndex -lt 0) { throw "Could not find country data marker in $sourceScript" }

# Reuse the existing South America data table without executing the old renderer.
$dataBlock = $sourceText.Substring(0, $markerIndex)
Invoke-Expression $dataBlock
$locRoot = Join-Path $repoRoot 'content\locations'

$ICONS_EVENTS = '<a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
$ICONS_WORLD  = '<a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
$ICONS_CAT    = '<a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
$BACK_ICON    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'

$CountryNames = [ordered]@{
  'argentina' = 'Argentina'
  'bolivia' = 'Bolivia'
  'brazil' = 'Brazil'
  'chile' = 'Chile'
  'colombia' = 'Colombia'
  'ecuador' = 'Ecuador'
  'guyana' = 'Guyana'
  'paraguay' = 'Paraguay'
  'peru' = 'Peru'
  'suriname' = 'Suriname'
  'uruguay' = 'Uruguay'
  'venezuela' = 'Venezuela'
}

$SouthAmericaGroups = @(
  [pscustomobject]@{ Label = 'Andean countries'; Slugs = @('bolivia', 'chile', 'colombia', 'ecuador', 'peru', 'venezuela') },
  [pscustomobject]@{ Label = 'Southern Cone'; Slugs = @('argentina', 'chile', 'paraguay', 'uruguay') },
  [pscustomobject]@{ Label = 'Amazon countries'; Slugs = @('bolivia', 'brazil', 'colombia', 'ecuador', 'guyana', 'peru', 'suriname', 'venezuela') },
  [pscustomobject]@{ Label = 'Pacific South America'; Slugs = @('chile', 'colombia', 'ecuador', 'peru') },
  [pscustomobject]@{ Label = 'Guianas'; Slugs = @('guyana', 'suriname') },
  [pscustomobject]@{ Label = 'Rio de la Plata'; Slugs = @('argentina', 'paraguay', 'uruguay') }
)

$FoodProfiles = @{
  'argentina' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'wine'; DrinkTitle = 'Wine' }
  'bolivia' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'brazil' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'chile' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'wine'; DrinkTitle = 'Wine' }
  'colombia' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'ecuador' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'guyana' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'paraguay' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'peru' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'suriname' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'uruguay' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'wine'; DrinkTitle = 'Wine' }
  'venezuela' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
}

$EventImageBySlug = @{
  'brazil-independence-day' = '/en/content/categories/culture/national-day/events/img/brazil-independence-day-mini.png'
  'buenos-aires-tango-festival' = '/en/content/categories/culture/music/events/img/buenos-aires-tango-festival-mini.png'
  'chile-independence-day-and-fiestas-patrias' = '/en/content/categories/culture/national-day/events/img/chile-independence-day-and-fiestas-patrias-mini.png'
  'copa-libertadores-final' = '/en/content/categories/sport/football/events/img/copa-libertadores-final-mini.png'
  'festa-junina' = '/en/content/categories/music/music-festivals/events/img/festa-junina-mini.png'
  'inti-raymi' = '/en/content/categories/culture/tradition/events/img/inti-raymi-mini.png'
  'medellin-flower-festival' = '/en/content/categories/culture/art/events/img/medellin-flower-festival-mini.png'
  'new-years-eve-copacabana' = '/en/content/categories/culture/tradition/events/img/new-years-eve-copacabana-mini.png'
  'oktoberfest-blumenau' = '/en/content/categories/culture/food-drink/events/img/oktoberfest-blumenau-mini.png'
  'sao-paulo-grand-prix' = '/en/content/categories/sport/formula-1/events/img/sao-paulo-grand-prix-mini.png'
}

function Repair-Text($value) {
  if ($null -eq $value) { return '' }
  $text = [System.Net.WebUtility]::HtmlDecode([string]$value).Trim()
  $hasMojibake = ($text.IndexOf([char]0x00C3) -ge 0) -or ($text.IndexOf([char]0x00C2) -ge 0)
  if ($hasMojibake) {
    try {
      $bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($text)
      $fixed = [System.Text.Encoding]::UTF8.GetString($bytes)
      $stillBroken = ($fixed.IndexOf([char]0x00C3) -ge 0) -or ($fixed.IndexOf([char]0x00C2) -ge 0) -or ($fixed.IndexOf([char]0xFFFD) -ge 0)
      if (-not $stillBroken) { return $fixed.Trim() }
    } catch {}
  }
  return $text
}

function Html($value) {
  return [System.Net.WebUtility]::HtmlEncode((Repair-Text $value))
}

function Clean-Title($value) {
  return ((Repair-Text $value) -replace '\s*\|\s*OneSliders.*$', '').Trim()
}

function First-Match($html, $pattern) {
  $m = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($m.Success) { return Repair-Text $m.Groups[1].Value }
  return ''
}

function Normalize-Href($href) {
  $clean = Repair-Text $href
  return ($clean -replace '^\.\./\.\./\.\./\.\./', '/')
}

function Get-CityLinks($html) {
  $items = @()
  $seen = @{}
  $cityMatches = [regex]::Matches($html, '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($cityMatches.Count -eq 0) {
    $cityMatches = [regex]::Matches($html, '<a class="country-path" href="([^"]+)">\s*<span>City</span>\s*<strong>Open ([^<]+)</strong>\s*</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  }
  foreach ($m in $cityMatches) {
    $href = Repair-Text $m.Groups[1].Value
    $name = Repair-Text $m.Groups[2].Value
    if (-not $href -or -not $name -or $seen.ContainsKey($href)) { continue }
    $seen[$href] = $true
    $items += [pscustomobject]@{ Href = $href; Name = $name }
  }
  return @($items)
}

function Get-EventLinks($html) {
  $items = @()
  $seen = @{}
  $eventMatches = [regex]::Matches($html, 'class="event-card" href="([^"]+)".*?class="event-date">([^<]+)</span><strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($eventMatches.Count -eq 0) {
    $eventMatches = [regex]::Matches($html, '<a class="visual-topic-card[^"]*"[^>]*href="([^"]+)"[^>]*>.*?<strong>([^<]+)</strong>\s*<span>([^<]+)</span>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($m in $eventMatches) {
      $href = Normalize-Href $m.Groups[1].Value
      $title = Repair-Text $m.Groups[2].Value
      $date = Repair-Text $m.Groups[3].Value
      $date = $date -replace '\s*&middot;.*$', ''
      $date = $date -replace ('\s*' + [regex]::Escape([string][char]0x00B7) + '.*$'), ''
      if ($href -notmatch '/events/') { continue }
      if (-not $href -or -not $title -or $seen.ContainsKey($href)) { continue }
      $seen[$href] = $true
      $items += [pscustomobject]@{ Href = $href; Date = $date; Title = $title }
    }
    return @($items)
  }
  foreach ($m in $eventMatches) {
    $href = Normalize-Href $m.Groups[1].Value
    $date = Repair-Text $m.Groups[2].Value
    $title = Repair-Text $m.Groups[3].Value
    if (-not $href -or -not $title -or $seen.ContainsKey($href)) { continue }
    $seen[$href] = $true
    $items += [pscustomobject]@{ Href = $href; Date = $date; Title = $title }
  }
  return @($items)
}

function Get-FoodProfile($slug) {
  if ($FoodProfiles.ContainsKey($slug)) { return $FoodProfiles[$slug] }
  return @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
}

function Get-EventImage($href) {
  $clean = ([string]$href) -split '#', 2 | Select-Object -First 1
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($clean)
  if ($EventImageBySlug.ContainsKey($slug)) { return $EventImageBySlug[$slug] }
  return '/content/locations/south-america/img/south-america-mini.png'
}

function Get-EventEndDate($label) {
  $yearMatch = [regex]::Match($label, '(20\d{2})')
  $year = if ($yearMatch.Success) { $yearMatch.Groups[1].Value } else { '2026' }
  $monthMatches = [regex]::Matches($label, 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec')
  if ($monthMatches.Count -eq 0) { return "$year-12-31" }
  $month = $monthMatches[$monthMatches.Count - 1].Value
  $ends = @{
    Jan='01-31'; Feb='02-28'; Mar='03-31'; Apr='04-30'; May='05-31'; Jun='06-30'
    Jul='07-31'; Aug='08-31'; Sep='09-30'; Oct='10-31'; Nov='11-30'; Dec='12-31'
  }
  return "$year-$($ends[$month])"
}

function Build-GroupHtml($slug) {
  $groups = @($SouthAmericaGroups | Where-Object { $_.Slugs -contains $slug })
  if ($groups.Count -eq 0) { return '' }
  $out = '<div class="country-left-stack"><div class="country-panel-card"><h2>Part of</h2><div class="country-group-list">'
  foreach ($group in $groups) {
    $out += '<div class="country-group"><strong>' + (Html $group.Label) + '</strong><div class="country-chip-row">'
    foreach ($member in $group.Slugs) {
      $name = $CountryNames[$member]
      $out += '<a class="country-chip" href="../' + $member + '/index.html"><img src="../' + $member + '/img/flag.svg" alt="">' + (Html $name) + '</a>'
    }
    $out += '</div></div>'
  }
  $out += '</div></div></div>'
  return $out
}

function Build-CityPaths($cities) {
  $out = '<div class="country-paths">'
  foreach ($city in $cities) {
    $out += '<a class="country-path" href="' + (Html $city.Href) + '"><span>City</span><strong>Open ' + (Html $city.Name) + '</strong></a>'
  }
  $out += '<a class="country-path" href="../../../locations/index.html"><span>Browse</span><strong>More locations</strong></a>'
  $out += '<a class="country-path" href="../../../categories/index.html"><span>Topics</span><strong>Travel interests</strong></a>'
  $out += '</div>'
  return $out
}

function Build-EventCards($events, $countryTitle) {
  if ($events.Count -eq 0) {
    return '<p class="country-empty">No future ' + (Html $countryTitle) + '-linked events are active in the current dataset.</p>'
  }
  $out = ''
  foreach ($event in $events) {
    $href = Html $event.Href
    $date = Html $event.Date
    $title = Html $event.Title
    $img = Html (Get-EventImage $event.Href)
    $end = Html (Get-EventEndDate $event.Date)
    $cardClass = if ($event.Href -match '/culture/') { 'visual-topic-card visual-topic-card--national' } else { 'visual-topic-card visual-topic-card--music' }
    $out += '<a class="' + $cardClass + '" data-end="' + $end + '" href="' + $href + '"><img src="' + $img + '" alt="" loading="lazy"><strong>' + $title + '</strong><span>' + $date + ' &middot; ' + (Html $countryTitle) + '</span></a>'
  }
  return $out
}

function Build-TopicCards($slug) {
  $secondHref = '../../../categories/nature/index.html'
  $secondTitle = 'South American outdoors'
  $secondText = 'Andes routes, rainforest, coastlines and protected nature.'
  $amazon = @('bolivia', 'brazil', 'colombia', 'ecuador', 'guyana', 'peru', 'suriname', 'venezuela')
  $southern = @('argentina', 'chile', 'paraguay', 'uruguay')
  if ($amazon -contains $slug) {
    $secondHref = '../../../categories/climate/protected-nature.html'
    $secondTitle = 'Amazon and wild nature'
    $secondText = 'Rainforest, river systems, wildlife and conservation calendars.'
  } elseif ($southern -contains $slug) {
    $secondHref = '../../../categories/climate/weather.html'
    $secondTitle = 'Southern seasons'
    $secondText = 'Patagonia, pampas, vineyards and seasonal trip planning.'
  }
  return '<div class="country-paths country-paths--topics"><a class="visual-topic-card visual-topic-card--music" href="../../../categories/music/index.html"><img src="/en/content/categories/music/song-contests/events/img/eurovision-song-contest-mini.png" alt="" loading="lazy"><strong>Music &amp; Culture</strong><span>Festivals, concerts and cultural calendars.</span></a><a class="visual-topic-card visual-topic-card--national" href="' + $secondHref + '"><img src="/content/locations/south-america/img/south-america-mini.png" alt="" loading="lazy"><strong>' + (Html $secondTitle) + '</strong><span>' + (Html $secondText) + '</span></a></div>'
}

function Build-CountryOnePage($filePath) {
  $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
  $rel = $filePath.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Length -ne 3 -or $parts[0] -ne 'south-america' -or $parts[2] -ne 'index.html') { return $null }

  $slug = $parts[1]
  $d = $CD[$slug]
  if (-not $d) { Write-Host "  SKIP (no data): $slug"; return $null }

  $title = $CountryNames[$slug]
  if (-not $title) { $title = Clean-Title (First-Match $html '<title>([^<]+)</title>') }

  $capMatch = [regex]::Match($html, 'Capital</span><strong>(?:<a class="value-link" href="([^"]+)">([^<]+)</a>|<a href="([^"]+)">([^<]+)</a>|([^<]+))</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $capLink = ''
  $capName = ''
  if ($capMatch.Success) {
    $capLink = if ($capMatch.Groups[1].Value) { Repair-Text $capMatch.Groups[1].Value } else { Repair-Text $capMatch.Groups[3].Value }
    $capName = if ($capMatch.Groups[2].Value) { Repair-Text $capMatch.Groups[2].Value } elseif ($capMatch.Groups[4].Value) { Repair-Text $capMatch.Groups[4].Value } else { Repair-Text $capMatch.Groups[5].Value }
  }
  if (-not $capName) { $capName = 'TBC' }

  $lang = First-Match $html 'Language</span><strong>([^<]+)</strong>'
  if (-not $lang) { $lang = 'TBC' }
  $curr = First-Match $html 'Currency</span><strong>([^<]+)</strong>'
  if (-not $curr) { $curr = 'TBC' }
  $pop = First-Match $html 'Population</span><strong>([^<]+)</strong>'
  if (-not $pop) { $pop = 'TBC' }

  $capHtml = if ($capLink) {
    '<a class="value-link" href="' + (Html $capLink) + '">' + (Html $capName) + '</a>'
  } else {
    Html $capName
  }

  $cities = Get-CityLinks $html
  $events = Get-EventLinks $html
  $food = Get-FoodProfile $slug

  $heroPath = Join-Path (Split-Path $filePath -Parent) ("img\$slug-hero.png")
  $heroImage = if (Test-Path $heroPath) {
    '/content/locations/south-america/' + $slug + '/img/' + $slug + '-hero.png'
  } else {
    '/content/locations/south-america/img/south-america-hero.jpg'
  }
  $heroStyle = ' style="--country-hero-url: url(''' + $heroImage + ''')"'

  $worthSeeing = ''
  foreach ($item in @($d.wv | Select-Object -First 3)) {
    $worthSeeing += '<li><strong>' + (Html $item[0]) + ':</strong> ' + (Html $item[1]) + '</li>'
  }
  $known = (@($d.wv | Select-Object -First 3) | ForEach-Object { Repair-Text $_[0] }) -join ', '

  $identityTerms = @()
  $identityTerms += @($d.wv | Select-Object -First 3 | ForEach-Object { Repair-Text $_[0] })
  $identityTerms += $capName
  $identityTerms += $food.FoodTitle
  $identityTerms += $food.DrinkTitle
  $identityGrid = ''
  foreach ($term in ($identityTerms | Where-Object { $_ } | Select-Object -First 8)) {
    $identityGrid += '<span>' + (Html $term) + '</span>'
  }

  $foodCards = '<div class="country-panel-card country-panel-card--food"><h2>Food &amp; drink</h2><div class="country-paths country-paths--topics country-paths--food">'
  $foodCards += '<a class="visual-topic-card visual-topic-card--food" href="../../../categories/food/' + $food.FoodSlug + '.html"><img src="/content/categories/food/img/' + $food.FoodSlug + '-mini.png" alt="" loading="lazy"><strong>' + (Html $food.FoodTitle) + '</strong><span>Signature dish</span></a>'
  $foodCards += '<a class="visual-topic-card visual-topic-card--food" href="../../../categories/drinks/' + $food.DrinkSlug + '.html"><img src="/content/categories/drinks/img/' + $food.DrinkSlug + '-mini.png" alt="" loading="lazy"><strong>' + (Html $food.DrinkTitle) + '</strong><span>Local drink</span></a>'
  $foodCards += '</div></div>'

  $groupHtml = Build-GroupHtml $slug
  $cityPaths = Build-CityPaths $cities
  $eventCards = Build-EventCards $events $title
  $topicCards = Build-TopicCards $slug

  $HEAD = @"
<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="../../../../assets/css/oneslider-core.css">
  <script src="../../../../assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../assets/css/locations.css?v=country-onepage-south-america-20260527">
  <meta name="theme-color" content="#0d2137">
  <title>$(Html $title) | OneSliders</title>
</head>
<body class="country-onepage">
"@

  $NAV = @"
  <nav class="top-menu" aria-label="Location navigation">
    $ICONS_EVENTS
    $ICONS_WORLD
    $ICONS_CAT
    <span class="nav-divider"></span>
    <a class="nav-back" href="../index.html" title="Back to South America" aria-label="Back to South America">$BACK_ICON<span>South America</span></a>
    <a class="nav-pill" href="../index.html">South America</a>
    <a class="nav-pill active" aria-current="page" href="index.html">$(Html $title)</a>
  </nav>
"@

  $BODY = @"
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="$(Html $title) one-slide overview">
      <div class="country-brief__copy">
        <div class="country-hero-image"$heroStyle aria-hidden="true"></div>
        <img class="flag-badge" src="img/flag.svg" alt="$(Html $title) flag">
        <h1 class="hero-title">$(Html $title)</h1>
        $groupHtml
      </div>
      <div class="country-brief__panel">
        <div class="country-kpis">
          <div class="country-kpi"><span>Capital</span><strong>$capHtml</strong></div>
          <div class="country-kpi"><span>Population</span><strong>$(Html $pop)</strong></div>
          <div class="country-kpi"><span>Area</span><strong>$(Html $d.a)</strong></div>
          <div class="country-kpi"><span>Currency</span><strong>$(Html $curr)</strong></div>
        </div>
        <section class="persona-tabs" aria-label="Choose $(Html $title) view">
          <input type="radio" name="$slug-view" id="view-visit" checked>
          <input type="radio" name="$slug-view" id="view-events">
          <input type="radio" name="$slug-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose $(Html $title) outcome">
            <label for="view-visit" role="tab">Plan a visit</label>
            <label for="view-events" role="tab">Find events</label>
            <label for="view-context" role="tab">Understand $(Html $title)</label>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card country-panel-card--split">
              <div><h2>Short facts</h2><div class="fact-table country-facts-tight"><div class="fact-row"><span>Region</span><strong>$(Html $d.r)</strong></div><div class="fact-row"><span>Language</span><strong>$(Html $lang)</strong></div><div class="fact-row"><span>Time zone</span><strong>$(Html $d.tz)</strong></div><div class="fact-row"><span>Drives on</span><strong>$(Html $d.dr)</strong></div></div></div>
              <div><h2>Worth seeing</h2><ul class="country-points">$worthSeeing</ul></div>
            </div>
            $cityPaths
            <div class="country-panel-card"><h2>Planning questions</h2><div class="country-qa-list"><div><strong>What is $(Html $title) known for?</strong><span>$(Html $known).</span></div><div><strong>What is the capital?</strong><span>$(Html $capName).</span></div><div><strong>Which language is useful?</strong><span>$(Html $lang).</span></div><div><strong>When is the national day?</strong><span>$(Html $d.nd).</span></div><div><strong>How should I browse it here?</strong><span>Start with the facts, jump to linked cities, then check events and topics.</span></div></div></div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card"><h2>Upcoming events</h2><div class="country-paths country-paths--events" data-expiring-events>$eventCards</div></div>
          </div>
          <div class="persona-panel view-panel--context">
            $foodCards
            <div class="country-panel-card"><h2>Known for</h2><div class="country-identity-grid">$identityGrid</div></div>
            $topicCards
          </div>
        </section>
      </div>
    </section>
  </main>
  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. Updated May 2026.</footer>
</body>
</html>
"@

  return $HEAD + "`r`n" + $NAV + "`r`n" + $BODY
}

$files = Get-ChildItem "$locRoot\south-america" -Recurse -Filter 'index.html' | Where-Object {
  $rel = $_.FullName.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  $parts.Length -eq 3
}

$converted = 0
$skipped = 0
$errors = 0

foreach ($file in $files) {
  try {
    $result = Build-CountryOnePage $file.FullName
    if ($result) {
      [System.IO.File]::WriteAllText($file.FullName, $result, (New-Object System.Text.UTF8Encoding $false))
      $converted++
      Write-Host "  OK: $($file.FullName.Substring($locRoot.Length + 1))"
    } else {
      $skipped++
    }
  } catch {
    Write-Host "ERROR: $($file.FullName.Substring($locRoot.Length + 1)) - $_"
    $errors++
  }
}

Write-Host ''
Write-Host '=== DONE ==='
Write-Host "Converted : $converted"
Write-Host "Skipped   : $skipped"
Write-Host "Errors    : $errors"

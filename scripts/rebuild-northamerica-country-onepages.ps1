$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceScript = Join-Path $repoRoot 'rebuild-northamerica-countries.ps1'
$sourceText = [System.IO.File]::ReadAllText($sourceScript, [System.Text.Encoding]::UTF8)
$marker = '} # end $CD'
$markerIndex = $sourceText.IndexOf($marker)
if ($markerIndex -lt 0) { throw "Could not find country data marker in $sourceScript" }

# Reuse the existing North America data table and shared nav icon snippets.
$dataBlock = $sourceText.Substring(0, $markerIndex + $marker.Length)
Invoke-Expression $dataBlock
$locRoot = Join-Path $repoRoot 'content\locations'

$CountryNames = [ordered]@{
  'antigua-and-barbuda' = 'Antigua and Barbuda'
  'bahamas' = 'Bahamas'
  'barbados' = 'Barbados'
  'belize' = 'Belize'
  'canada' = 'Canada'
  'costa-rica' = 'Costa Rica'
  'cuba' = 'Cuba'
  'dominica' = 'Dominica'
  'dominican-republic' = 'Dominican Republic'
  'el-salvador' = 'El Salvador'
  'grenada' = 'Grenada'
  'guatemala' = 'Guatemala'
  'haiti' = 'Haiti'
  'honduras' = 'Honduras'
  'jamaica' = 'Jamaica'
  'mexico' = 'Mexico'
  'nicaragua' = 'Nicaragua'
  'panama' = 'Panama'
  'saint-kitts-and-nevis' = 'Saint Kitts and Nevis'
  'saint-lucia' = 'Saint Lucia'
  'saint-vincent-and-the-grenadines' = 'Saint Vincent and the Grenadines'
  'trinidad-and-tobago' = 'Trinidad and Tobago'
  'usa' = 'USA'
}

$NorthAmericaGroups = @(
  [pscustomobject]@{ Label = 'Northern America'; Slugs = @('canada', 'usa') },
  [pscustomobject]@{ Label = 'Mexico and Central America'; Slugs = @('mexico', 'belize', 'costa-rica', 'el-salvador', 'guatemala', 'honduras', 'nicaragua', 'panama') },
  [pscustomobject]@{ Label = 'Central America'; Slugs = @('belize', 'costa-rica', 'el-salvador', 'guatemala', 'honduras', 'nicaragua', 'panama') },
  [pscustomobject]@{ Label = 'Caribbean'; Slugs = @('antigua-and-barbuda', 'bahamas', 'barbados', 'cuba', 'dominica', 'dominican-republic', 'grenada', 'haiti', 'jamaica', 'saint-kitts-and-nevis', 'saint-lucia', 'saint-vincent-and-the-grenadines', 'trinidad-and-tobago') },
  [pscustomobject]@{ Label = 'Greater Antilles'; Slugs = @('cuba', 'dominican-republic', 'haiti', 'jamaica') },
  [pscustomobject]@{ Label = 'Lesser Antilles'; Slugs = @('antigua-and-barbuda', 'barbados', 'dominica', 'grenada', 'saint-kitts-and-nevis', 'saint-lucia', 'saint-vincent-and-the-grenadines', 'trinidad-and-tobago') }
)

$FoodProfiles = @{
  'canada' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'cuba' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'mojito'; DrinkTitle = 'Mojito' }
  'jamaica' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'mexico' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'beer'; DrinkTitle = 'Beer' }
  'usa' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'old-fashioned'; DrinkTitle = 'Old fashioned' }
}

$EventImageBySlug = @{
  'burning-man' = '/content/categories/culture/art/events/img/burning-man-mini.png'
  'calgary-stampede' = '/content/categories/culture/carnival/events/img/calgary-stampede-mini.png'
  'canada-grand-prix' = '/content/categories/sport/formula-1/events/img/canadian-grand-prix-mini.png'
  'day-of-the-dead' = '/content/categories/culture/tradition/events/img/day-of-the-dead-mini.png'
  'fifa-world-cup-2026' = '/content/categories/sport/football/events/img/fifa-world-cup-mini.png'
  'las-vegas-grand-prix' = '/content/categories/sport/formula-1/events/img/las-vegas-grand-prix-mini.png'
  'masters-tournament' = '/content/categories/sport/golf/events/img/masters-tournament-mini.png'
  'mexico-city-grand-prix' = '/content/categories/sport/formula-1/events/img/mexico-city-grand-prix-mini.png'
  'new-york-city-marathon' = '/content/categories/sport/running/events/img/new-york-city-marathon-mini.png'
  'pga-championship' = '/content/categories/sport/golf/events/img/pga-championship-mini.png'
  'united-states-grand-prix' = '/content/categories/sport/formula-1/events/img/united-states-grand-prix-mini.png'
  'us-open-golf' = '/content/categories/sport/golf/events/img/us-open-golf-mini.png'
  'us-open-tennis' = '/content/categories/sport/tennis/events/img/us-open-tennis-mini.png'
}

function Normalize-Text($value) {
  if ($null -eq $value) { return '' }
  $text = [string]$value
  $text = $text -replace [string][char]0x2014, '-'
  $text = $text -replace [string][char]0x2013, '-'
  $text = $text -replace [string][char]0x00A0, ' '
  $text = $text -replace '[^\x00-\x7F]', ''
  $text = $text -replace '\s{2,}', ' '
  return $text.Trim()
}

function Html($value) {
  return [System.Net.WebUtility]::HtmlEncode((Normalize-Text $value))
}

function Clean-Title($value) {
  return (([string]$value) -replace '\s*\|\s*OneSliders.*$', '').Trim()
}

function First-Match($html, $pattern) {
  $m = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return ''
}

function Get-CityLinks($html) {
  $items = @()
  $seen = @{}
  $cityMatches = [regex]::Matches($html, '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($cityMatches.Count -eq 0) {
    $cityMatches = [regex]::Matches($html, '<a class="country-path" href="([^"]+)">\s*<span>City</span>\s*<strong>Open ([^<]+)</strong>\s*</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  }
  foreach ($m in $cityMatches) {
    $href = $m.Groups[1].Value.Trim()
    $name = $m.Groups[2].Value.Trim()
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
      $href = $m.Groups[1].Value.Trim()
      $title = $m.Groups[2].Value.Trim()
      $date = $m.Groups[3].Value.Trim()
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
    $href = $m.Groups[1].Value.Trim()
    $date = $m.Groups[2].Value.Trim()
    $title = $m.Groups[3].Value.Trim()
    if (-not $href -or -not $title -or $seen.ContainsKey($href)) { continue }
    $seen[$href] = $true
    $items += [pscustomobject]@{ Href = $href; Date = $date; Title = $title }
  }
  return @($items)
}

function Get-FoodProfile($slug) {
  if ($FoodProfiles.ContainsKey($slug)) { return $FoodProfiles[$slug] }
  $caribbeanDrink = @('antigua-and-barbuda', 'bahamas', 'barbados', 'dominican-republic', 'saint-kitts-and-nevis', 'saint-lucia', 'saint-vincent-and-the-grenadines', 'trinidad-and-tobago')
  if ($caribbeanDrink -contains $slug) {
    return @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'pina-colada'; DrinkTitle = 'Pina colada' }
  }
  return @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
}

function Get-EventImage($href) {
  $clean = ([string]$href) -split '#', 2 | Select-Object -First 1
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($clean)
  if ($EventImageBySlug.ContainsKey($slug)) { return $EventImageBySlug[$slug] }
  return '/content/locations/north-america/img/north-america-mini.png'
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
  $groups = @($NorthAmericaGroups | Where-Object { $_.Slugs -contains $slug })
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
  $secondTitle = 'North American outdoors'
  $secondText = 'National parks, coasts, mountains and regional routes.'
  $caribbean = @('antigua-and-barbuda', 'bahamas', 'barbados', 'cuba', 'dominica', 'dominican-republic', 'grenada', 'haiti', 'jamaica', 'saint-kitts-and-nevis', 'saint-lucia', 'saint-vincent-and-the-grenadines', 'trinidad-and-tobago')
  $central = @('belize', 'costa-rica', 'el-salvador', 'guatemala', 'honduras', 'nicaragua', 'panama', 'mexico')
  if ($caribbean -contains $slug) {
    $secondHref = '../../../categories/climate/marine.html'
    $secondTitle = 'Caribbean coastlines'
    $secondText = 'Islands, reefs, beaches and marine calendars.'
  } elseif ($central -contains $slug) {
    $secondHref = '../../../categories/climate/protected-nature.html'
    $secondTitle = 'Rainforest and volcanoes'
    $secondText = 'Protected nature, ancient sites and outdoor routes.'
  }
  return '<div class="country-paths country-paths--topics"><a class="visual-topic-card visual-topic-card--music" href="../../../categories/music/index.html"><img src="/content/categories/music/song-contests/events/img/eurovision-song-contest-mini.png" alt="" loading="lazy"><strong>Music &amp; Culture</strong><span>Festivals, concerts and cultural calendars.</span></a><a class="visual-topic-card visual-topic-card--national" href="' + $secondHref + '"><img src="/content/locations/north-america/img/north-america-mini.png" alt="" loading="lazy"><strong>' + (Html $secondTitle) + '</strong><span>' + (Html $secondText) + '</span></a></div>'
}

function Build-CountryOnePage($filePath) {
  $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
  $rel = $filePath.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Length -ne 3 -or $parts[0] -ne 'north-america' -or $parts[2] -ne 'index.html') { return $null }

  $slug = $parts[1]
  $d = $CD[$slug]
  if (-not $d) { Write-Host "  SKIP (no data): $slug"; return $null }

  $title = $CountryNames[$slug]
  if (-not $title) { $title = Clean-Title (First-Match $html '<title>([^<]+)</title>') }

  $capMatch = [regex]::Match($html, 'Capital</span><strong>(?:<a class="value-link" href="([^"]+)">([^<]+)</a>|<a href="([^"]+)">([^<]+)</a>|([^<]+))</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $capLink = ''
  $capName = ''
  if ($capMatch.Success) {
    $capLink = if ($capMatch.Groups[1].Value) { $capMatch.Groups[1].Value.Trim() } else { $capMatch.Groups[3].Value.Trim() }
    $capName = if ($capMatch.Groups[2].Value) { $capMatch.Groups[2].Value.Trim() } elseif ($capMatch.Groups[4].Value) { $capMatch.Groups[4].Value.Trim() } else { $capMatch.Groups[5].Value.Trim() }
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
  $heroClass = 'country-hero-image'
  $heroStyle = ' style="--country-hero-url: url(''/content/locations/north-america/' + $slug + '/img/' + $slug + '-hero.png'')"'
  if (-not (Test-Path $heroPath)) {
    $heroClass = 'country-hero-image country-hero-image--generated'
    $heroStyle = ''
  }

  $worthSeeing = ''
  foreach ($item in @($d.wv | Select-Object -First 3)) {
    $worthSeeing += '<li><strong>' + (Html $item[0]) + ':</strong> ' + (Html $item[1]) + '</li>'
  }
  $known = (@($d.wv | Select-Object -First 3) | ForEach-Object { $_[0] }) -join ', '

  $identityTerms = @()
  $identityTerms += @($d.wv | Select-Object -First 3 | ForEach-Object { $_[0] })
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
  <link rel="stylesheet" href="../../../../assets/css/locations.css?v=country-onepage-north-america-20260527">
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
    <a class="nav-back" href="../index.html" title="Back to North America" aria-label="Back to North America">$BACK_ICON<span>North America</span></a>
    <a class="nav-pill" href="../index.html">North America</a>
    <a class="nav-pill active" aria-current="page" href="index.html">$(Html $title)</a>
  </nav>
"@

  $BODY = @"
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="$(Html $title) one-slide overview">
      <div class="country-brief__copy">
        <div class="$heroClass"$heroStyle aria-hidden="true"></div>
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

  return $HEAD + $NAV + $BODY
}

$files = Get-ChildItem "$locRoot\north-america" -Recurse -Filter 'index.html' | Where-Object {
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

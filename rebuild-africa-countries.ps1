$repoRoot = Resolve-Path $PSScriptRoot
$locRoot = Join-Path $repoRoot 'content\locations'
$africaRoot = Join-Path $locRoot 'africa'

$ICONS_EVENTS = '<a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
$ICONS_WORLD  = '<a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
$ICONS_CAT    = '<a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
$BACK_ICON    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'

$AfricaGroups = @(
  [pscustomobject]@{ Label = 'North Africa'; Slugs = @('algeria', 'egypt', 'libya', 'mauritania', 'morocco', 'sudan', 'tunisia') },
  [pscustomobject]@{ Label = 'Maghreb'; Slugs = @('algeria', 'libya', 'mauritania', 'morocco', 'tunisia') },
  [pscustomobject]@{ Label = 'West Africa'; Slugs = @('benin', 'burkina-faso', 'cabo-verde', 'gambia', 'ghana', 'guinea', 'guinea-bissau', 'ivory-coast', 'liberia', 'mali', 'mauritania', 'niger', 'nigeria', 'senegal', 'sierra-leone', 'togo') },
  [pscustomobject]@{ Label = 'Central Africa'; Slugs = @('angola', 'cameroon', 'central-african-republic', 'chad', 'democratic-republic-of-the-congo', 'equatorial-guinea', 'gabon', 'republic-of-the-congo', 'sao-tome-and-principe') },
  [pscustomobject]@{ Label = 'East Africa'; Slugs = @('burundi', 'comoros', 'djibouti', 'eritrea', 'ethiopia', 'kenya', 'madagascar', 'malawi', 'mauritius', 'mozambique', 'rwanda', 'seychelles', 'somalia', 'south-sudan', 'tanzania', 'uganda', 'zambia', 'zimbabwe') },
  [pscustomobject]@{ Label = 'Horn of Africa'; Slugs = @('djibouti', 'eritrea', 'ethiopia', 'somalia') },
  [pscustomobject]@{ Label = 'Southern Africa'; Slugs = @('angola', 'botswana', 'eswatini', 'lesotho', 'malawi', 'mozambique', 'namibia', 'south-africa', 'zambia', 'zimbabwe') },
  [pscustomobject]@{ Label = 'Indian Ocean Africa'; Slugs = @('comoros', 'madagascar', 'mauritius', 'seychelles') },
  [pscustomobject]@{ Label = 'Sahel'; Slugs = @('burkina-faso', 'chad', 'mali', 'mauritania', 'niger', 'senegal', 'sudan', 'south-sudan') }
)

$IslandCountries = @('cabo-verde', 'comoros', 'madagascar', 'mauritius', 'sao-tome-and-principe', 'seychelles')
$DesertCountries = @('algeria', 'chad', 'egypt', 'libya', 'mali', 'mauritania', 'morocco', 'namibia', 'niger', 'sudan', 'tunisia')

function Normalize-Text($value) {
  if ($null -eq $value) { return '' }
  $text = [System.Net.WebUtility]::HtmlDecode([string]$value)
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

function Write-Utf8File($path, $content) {
  $encoding = New-Object System.Text.UTF8Encoding $false
  for ($attempt = 1; $attempt -le 5; $attempt++) {
    try {
      [System.IO.File]::WriteAllText($path, $content, $encoding)
      return
    } catch {
      if ($attempt -eq 5) { throw }
      [System.GC]::Collect()
      Start-Sleep -Milliseconds (200 * $attempt)
    }
  }
}

function Strip-Tags($value) {
  $text = [regex]::Replace([string]$value, '<[^>]+>', ' ')
  return Normalize-Text $text
}

function First-Match($html, $pattern) {
  $m = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return ''
}

function Clean-Title($html, $slug) {
  $title = Strip-Tags (First-Match $html '<title>([^<]+)</title>')
  $title = ($title -replace '\s*\|\s*OneSliders.*$', '').Trim()
  if ($title) { return $title }
  return (($slug -split '-') | ForEach-Object {
    if ($_ -eq 'of' -or $_ -eq 'and' -or $_ -eq 'the') { $_ } else { (Get-Culture).TextInfo.ToTitleCase($_) }
  }) -join ' '
}

function Get-FactValue($html, $labels) {
  foreach ($label in $labels) {
    $pattern = '<span>\s*' + [regex]::Escape($label) + '\s*</span>\s*<strong>(.*?)</strong>'
    $value = First-Match $html $pattern
    if ($value) { return Strip-Tags $value }
  }
  return ''
}

function Get-LinkedFact($html, $labels) {
  foreach ($label in $labels) {
    $pattern = '<span>\s*' + [regex]::Escape($label) + '\s*</span>\s*<strong>(.*?)</strong>'
    $value = First-Match $html $pattern
    if (-not $value) { continue }
    $link = [regex]::Match($value, '<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($link.Success) {
      return [pscustomobject]@{ Href = $link.Groups[1].Value.Trim(); Name = Strip-Tags $link.Groups[2].Value }
    }
    return [pscustomobject]@{ Href = ''; Name = Strip-Tags $value }
  }
  return [pscustomobject]@{ Href = ''; Name = '' }
}

function Get-CityLinks($html, $capital) {
  $items = @()
  $seen = @{}
  $patterns = @(
    '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>',
    '<a class="country-path" href="([^"]+)">\s*<span>City</span>\s*<strong>Open ([^<]+)</strong>\s*</a>'
  )
  foreach ($pattern in $patterns) {
    $matches = [regex]::Matches($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($m in $matches) {
      $href = $m.Groups[1].Value.Trim()
      $name = Strip-Tags $m.Groups[2].Value
      if (-not $href -or -not $name -or $seen.ContainsKey($href)) { continue }
      $seen[$href] = $true
      $items += [pscustomobject]@{ Href = $href; Name = $name }
    }
  }
  if ($items.Count -eq 0 -and $capital.Name -and $capital.Href) {
    $items += [pscustomobject]@{ Href = $capital.Href; Name = $capital.Name }
  }
  return @($items)
}

function Get-EventLinks($html) {
  $items = @()
  $seen = @{}
  $eventMatches = [regex]::Matches($html, '<a class="event-card" href="([^"]+)".*?class="event-date">([^<]+)</span><strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  foreach ($m in $eventMatches) {
    $href = $m.Groups[1].Value.Trim()
    $date = Strip-Tags $m.Groups[2].Value
    $title = Strip-Tags $m.Groups[3].Value
    if (-not $href -or -not $title -or $seen.ContainsKey($href)) { continue }
    $seen[$href] = $true
    $items += [pscustomobject]@{ Href = $href; Date = $date; Title = $title }
  }
  if ($items.Count -eq 0) {
    $cards = [regex]::Matches($html, '<a class="visual-topic-card[^"]*"[^>]*href="([^"]+)"[^>]*>.*?<strong>([^<]+)</strong>\s*<span>([^<]+)</span>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($m in $cards) {
      $href = $m.Groups[1].Value.Trim()
      if ($href -notmatch '/events/') { continue }
      $title = Strip-Tags $m.Groups[2].Value
      $dateRaw = [System.Net.WebUtility]::HtmlDecode($m.Groups[3].Value)
      $date = $dateRaw -replace ('\s*' + [regex]::Escape([string][char]0x00B7) + '.*$'), ''
      $date = $date -replace '\s*&middot;.*$', ''
      $date = Normalize-Text $date
      if (-not $href -or -not $title -or $seen.ContainsKey($href)) { continue }
      $seen[$href] = $true
      $items += [pscustomobject]@{ Href = $href; Date = $date; Title = $title }
    }
  }
  return @($items)
}

function Get-WorthItems($html, $title, $capitalName, $climate) {
  $items = @()
  $icons = [regex]::Matches($html, '<div class="icon-tile"><strong>([^<]+)</strong><span>([^<]+)</span></div>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  foreach ($m in $icons) {
    $label = Strip-Tags $m.Groups[1].Value
    $body = Strip-Tags $m.Groups[2].Value
    if ($label -and $body) { $items += [pscustomobject]@{ Title = $label; Text = $body } }
  }
  if ($items.Count -eq 0) {
    $points = [regex]::Matches($html, '<li><strong>([^<:]+):</strong>\s*(.*?)</li>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($m in $points) {
      $label = Strip-Tags $m.Groups[1].Value
      $body = Strip-Tags $m.Groups[2].Value
      if ($label -and $body) { $items += [pscustomobject]@{ Title = $label; Text = $body } }
    }
  }
  if ($items.Count -lt 3 -and $capitalName) {
    $items += [pscustomobject]@{ Title = 'City base'; Text = "$capitalName gives $title a clear planning anchor." }
  }
  if ($items.Count -lt 3 -and $climate) {
    $items += [pscustomobject]@{ Title = 'Landscape and climate'; Text = "$climate conditions shape routes and seasonality." }
  }
  if ($items.Count -lt 3) {
    $items += [pscustomobject]@{ Title = 'Culture calendar'; Text = 'Local food, music, markets and heritage routes reward date-aware planning.' }
  }
  return @($items | Select-Object -First 3)
}

function Get-PrimaryRegion($slug) {
  $groups = @($AfricaGroups | Where-Object { $_.Slugs -contains $slug })
  if ($groups.Count -eq 0) { return 'Africa' }
  return (($groups | Select-Object -First 2 | ForEach-Object { $_.Label }) -join ' / ')
}

function Build-GroupHtml($slug, $countryNames) {
  $groups = @($AfricaGroups | Where-Object { $_.Slugs -contains $slug })
  if ($groups.Count -eq 0) {
    $groups = @([pscustomobject]@{ Label = 'Africa'; Slugs = @($slug) })
  }
  $out = '<div class="country-left-stack"><div class="country-panel-card"><h2>Part of</h2><div class="country-group-list">'
  foreach ($group in $groups) {
    $out += '<div class="country-group"><strong>' + (Html $group.Label) + '</strong><div class="country-chip-row">'
    foreach ($member in $group.Slugs) {
      if (-not $countryNames.Contains($member)) { continue }
      $name = $countryNames[$member]
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

function Get-EventImage($href) {
  $clean = ([string]$href) -split '#', 2 | Select-Object -First 1
  $normalized = $clean -replace '^(\.\./)+', '/'
  if ($normalized -notmatch '^/') { $normalized = '/' + $normalized }
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($normalized)
  $lastSlash = $normalized.LastIndexOf('/')
  if ($lastSlash -lt 0 -or -not $slug) { return '/content/locations/africa/img/africa-mini.png' }
  return $normalized.Substring(0, $lastSlash) + '/img/' + $slug + '-mini.png'
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

function Get-FoodProfile($slug) {
  if ($slug -eq 'ethiopia' -or $slug -eq 'kenya' -or $slug -eq 'rwanda' -or $slug -eq 'tanzania' -or $slug -eq 'uganda') {
    return @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  }
  return @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
}

function Build-TopicCards($slug) {
  $secondHref = '../../../categories/nature/index.html'
  $secondTitle = 'African outdoors'
  $secondText = 'Parks, coasts, desert routes and seasonal nature calendars.'
  if ($IslandCountries -contains $slug) {
    $secondHref = '../../../categories/climate/marine.html'
    $secondTitle = 'Island and coast routes'
    $secondText = 'Marine weather, beaches, reefs and island travel windows.'
  } elseif ($DesertCountries -contains $slug) {
    $secondHref = '../../../categories/climate/index.html'
    $secondTitle = 'Desert and dry-season planning'
    $secondText = 'Weather windows, heat, distance and route timing.'
  }
  return '<div class="country-paths country-paths--topics"><a class="visual-topic-card visual-topic-card--music" href="../../../categories/music/index.html"><img src="/en/content/categories/music/song-contests/events/img/eurovision-song-contest-mini.png" alt="" loading="lazy"><strong>Music &amp; Culture</strong><span>Festivals, concerts and cultural calendars.</span></a><a class="visual-topic-card visual-topic-card--national" href="' + $secondHref + '"><img src="/content/locations/africa/img/africa-mini.png" alt="" loading="lazy"><strong>' + (Html $secondTitle) + '</strong><span>' + (Html $secondText) + '</span></a></div>'
}

function Build-CountryOnePage($filePath, $countryNames) {
  $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
  $slug = Split-Path (Split-Path $filePath -Parent) -Leaf
  $title = Clean-Title $html $slug

  $capital = Get-LinkedFact $html @('Capital', 'Capital city')
  if (-not $capital.Name) { $capital = [pscustomobject]@{ Href = ''; Name = 'TBC' } }
  $lang = Get-FactValue $html @('Language')
  if (-not $lang) { $lang = 'TBC' }
  $curr = Get-FactValue $html @('Currency')
  if (-not $curr) { $curr = 'TBC' }
  $pop = Get-FactValue $html @('Population')
  if (-not $pop) { $pop = 'TBC' }
  $area = Get-FactValue $html @('Area')
  if (-not $area) { $area = 'TBC' }
  $climate = Get-FactValue $html @('Climate')
  if (-not $climate) { $climate = 'TBC' }
  $timeZone = Get-FactValue $html @('Time zone')
  if (-not $timeZone) { $timeZone = 'TBC' }
  $drives = Get-FactValue $html @('Drives on')
  if (-not $drives) { $drives = 'TBC' }
  $nationalDay = Get-FactValue $html @('National day')
  if (-not $nationalDay) { $nationalDay = 'TBC' }

  $capHtml = if ($capital.Href) {
    '<a class="value-link" href="' + (Html $capital.Href) + '">' + (Html $capital.Name) + '</a>'
  } else {
    Html $capital.Name
  }

  $cities = Get-CityLinks $html $capital
  $events = Get-EventLinks $html
  $worthItems = Get-WorthItems $html $title $capital.Name $climate
  $food = Get-FoodProfile $slug
  $region = Get-PrimaryRegion $slug

  $heroPath = Join-Path (Split-Path $filePath -Parent) ("img\$slug-hero.png")
  $heroClass = 'country-hero-image'
  $heroStyle = ' style="--country-hero-url: url(''/content/locations/africa/' + $slug + '/img/' + $slug + '-hero.png'')"'
  if (-not (Test-Path $heroPath)) {
    $heroClass = 'country-hero-image country-hero-image--generated'
    $heroStyle = ''
  }

  $worthSeeing = ''
  foreach ($item in $worthItems) {
    $worthSeeing += '<li><strong>' + (Html $item.Title) + ':</strong> ' + (Html $item.Text) + '</li>'
  }
  $known = (@($worthItems | ForEach-Object { $_.Title }) | Where-Object { $_ }) -join ', '
  if (-not $known) { $known = $title }

  $identityTerms = @()
  $identityTerms += @($worthItems | ForEach-Object { $_.Title })
  $identityTerms += $capital.Name
  $identityTerms += $climate
  $identityTerms += $food.FoodTitle
  $identityTerms += $food.DrinkTitle
  $identityGrid = ''
  foreach ($term in ($identityTerms | Where-Object { $_ -and $_ -ne 'TBC' } | Select-Object -First 8)) {
    $identityGrid += '<span>' + (Html $term) + '</span>'
  }

  $foodCards = '<div class="country-panel-card country-panel-card--food"><h2>Food &amp; drink</h2><div class="country-paths country-paths--topics country-paths--food">'
  $foodCards += '<a class="visual-topic-card visual-topic-card--food" href="../../../categories/food/' + $food.FoodSlug + '.html"><img src="/content/categories/food/img/' + $food.FoodSlug + '-mini.png" alt="" loading="lazy"><strong>' + (Html $food.FoodTitle) + '</strong><span>Signature dish</span></a>'
  $foodCards += '<a class="visual-topic-card visual-topic-card--food" href="../../../categories/drinks/' + $food.DrinkSlug + '.html"><img src="/content/categories/drinks/img/' + $food.DrinkSlug + '-mini.png" alt="" loading="lazy"><strong>' + (Html $food.DrinkTitle) + '</strong><span>Local drink</span></a>'
  $foodCards += '</div></div>'

  $groupHtml = Build-GroupHtml $slug $countryNames
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
  <link rel="stylesheet" href="../../../../assets/css/locations.css?v=country-onepage-africa-20260527">
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
    <a class="nav-back" href="../index.html" title="Back to Africa" aria-label="Back to Africa">$BACK_ICON<span>Africa</span></a>
    <a class="nav-pill" href="../index.html">Africa</a>
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
          <div class="country-kpi"><span>Area</span><strong>$(Html $area)</strong></div>
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
              <div><h2>Short facts</h2><div class="fact-table country-facts-tight"><div class="fact-row"><span>Region</span><strong>$(Html $region)</strong></div><div class="fact-row"><span>Language</span><strong>$(Html $lang)</strong></div><div class="fact-row"><span>Time zone</span><strong>$(Html $timeZone)</strong></div><div class="fact-row"><span>Drives on</span><strong>$(Html $drives)</strong></div></div></div>
              <div><h2>Worth seeing</h2><ul class="country-points">$worthSeeing</ul></div>
            </div>
            $cityPaths
            <div class="country-panel-card"><h2>Planning questions</h2><div class="country-qa-list"><div><strong>What is $(Html $title) known for?</strong><span>$(Html $known).</span></div><div><strong>What is the capital?</strong><span>$(Html $capital.Name).</span></div><div><strong>Which language is useful?</strong><span>$(Html $lang).</span></div><div><strong>When is the national day?</strong><span>$(Html $nationalDay).</span></div><div><strong>How should I browse it here?</strong><span>Start with the facts, jump to linked cities, then check events and topics.</span></div></div></div>
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

$files = Get-ChildItem $africaRoot -Directory | Where-Object {
  $_.Name -ne 'img' -and (Test-Path (Join-Path $_.FullName 'index.html'))
} | ForEach-Object {
  Join-Path $_.FullName 'index.html'
}

$countryNames = @{}
foreach ($file in $files) {
  $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
  $slug = Split-Path (Split-Path $file -Parent) -Leaf
  $countryNames[$slug] = Clean-Title $html $slug
}

$converted = 0
$errors = 0

foreach ($file in $files) {
  try {
    $result = Build-CountryOnePage $file $countryNames
    Write-Utf8File $file $result
    $converted++
    Write-Host "  OK: $((Split-Path (Split-Path $file -Parent) -Leaf))"
  } catch {
    Write-Host "ERROR: $file - $_"
    $errors++
  }
}

Write-Host ''
Write-Host "=== DONE: $converted Africa country pages rebuilt, $errors errors ==="

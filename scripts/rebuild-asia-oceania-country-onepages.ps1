$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$locRoot = Join-Path $repoRoot 'content\locations'

$ICONS_EVENTS = '<a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
$ICONS_WORLD = '<a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
$ICONS_CAT = '<a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
$BACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'

$AsiaGroups = @(
  [pscustomobject]@{ Label = 'Central Asia'; Slugs = @('kazakhstan', 'kyrgyzstan', 'tajikistan', 'turkmenistan', 'uzbekistan') },
  [pscustomobject]@{ Label = 'East Asia'; Slugs = @('china', 'japan', 'mongolia', 'north-korea', 'south-korea', 'taiwan') },
  [pscustomobject]@{ Label = 'South Asia'; Slugs = @('afghanistan', 'bangladesh', 'bhutan', 'india', 'maldives', 'nepal', 'pakistan', 'sri-lanka') },
  [pscustomobject]@{ Label = 'Southeast Asia'; Slugs = @('brunei', 'cambodia', 'indonesia', 'laos', 'malaysia', 'myanmar', 'philippines', 'singapore', 'thailand', 'timor-leste', 'vietnam') },
  [pscustomobject]@{ Label = 'Western Asia'; Slugs = @('bahrain', 'iran', 'iraq', 'israel', 'jordan', 'kuwait', 'lebanon', 'oman', 'palestine', 'qatar', 'saudi-arabia', 'syria', 'united-arab-emirates', 'yemen') },
  [pscustomobject]@{ Label = 'Arabian Peninsula'; Slugs = @('bahrain', 'kuwait', 'oman', 'qatar', 'saudi-arabia', 'united-arab-emirates', 'yemen') },
  [pscustomobject]@{ Label = 'Gulf states'; Slugs = @('bahrain', 'kuwait', 'oman', 'qatar', 'saudi-arabia', 'united-arab-emirates') },
  [pscustomobject]@{ Label = 'Levant'; Slugs = @('israel', 'jordan', 'lebanon', 'palestine', 'syria') },
  [pscustomobject]@{ Label = 'Himalaya region'; Slugs = @('bhutan', 'india', 'nepal', 'pakistan') },
  [pscustomobject]@{ Label = 'Malay Archipelago'; Slugs = @('brunei', 'indonesia', 'malaysia', 'philippines', 'singapore', 'timor-leste') }
)

$OceaniaGroups = @(
  [pscustomobject]@{ Label = 'Australasia'; Slugs = @('australia', 'new-zealand') },
  [pscustomobject]@{ Label = 'Melanesia'; Slugs = @('fiji', 'papua-new-guinea', 'solomon-islands', 'vanuatu') },
  [pscustomobject]@{ Label = 'Micronesia'; Slugs = @('kiribati', 'marshall-islands', 'micronesia', 'nauru', 'palau') },
  [pscustomobject]@{ Label = 'Polynesia'; Slugs = @('samoa', 'tonga', 'tuvalu') },
  [pscustomobject]@{ Label = 'Pacific Islands'; Slugs = @('fiji', 'kiribati', 'marshall-islands', 'micronesia', 'nauru', 'palau', 'papua-new-guinea', 'samoa', 'solomon-islands', 'tonga', 'tuvalu', 'vanuatu') }
)

$FoodProfiles = @{
  'australia' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'beer'; DrinkTitle = 'Beer' }
  'bahrain' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'china' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'india' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'indonesia' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'iran' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'iraq' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'israel' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'japan' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'jordan' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'kazakhstan' = @{ FoodSlug = 'plov'; FoodTitle = 'Plov'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'kuwait' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'kyrgyzstan' = @{ FoodSlug = 'plov'; FoodTitle = 'Plov'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'lebanon' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'malaysia' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'new-zealand' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'oman' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'pakistan' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'palestine' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'qatar' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'saudi-arabia' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'singapore' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'south-korea' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'syria' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'tajikistan' = @{ FoodSlug = 'plov'; FoodTitle = 'Plov'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'thailand' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'turkmenistan' = @{ FoodSlug = 'plov'; FoodTitle = 'Plov'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'united-arab-emirates' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'uzbekistan' = @{ FoodSlug = 'plov'; FoodTitle = 'Plov'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
  'vietnam' = @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
  'yemen' = @{ FoodSlug = 'kebab'; FoodTitle = 'Kebab'; DrinkSlug = 'coffee'; DrinkTitle = 'Coffee' }
}

$EventImageBySlug = @{
  'abu-dhabi-grand-prix' = '/en/content/categories/sport/formula-1/events/img/abu-dhabi-grand-prix-mini.png'
  'afc-asian-cup-2027' = '/en/content/categories/sport/football/events/img/afc-asian-cup-mini.png'
  'afl-grand-final' = '/en/content/categories/sport/aussie-rules/events/img/afl-grand-final-mini.png'
  'asian-games-2026' = '/en/content/categories/sport/multi-sport/events/img/asian-games-mini.png'
  'australian-open-2027' = '/en/content/categories/sport/tennis/events/img/australian-open-mini.png'
  'bali-arts-festival' = '/en/content/categories/culture/art/events/img/bali-arts-festival-mini.png'
  'bledisloe-cup' = '/en/content/categories/sport/rugby/events/img/bledisloe-cup-mini.png'
  'diwali-2026' = '/en/content/categories/culture/religion/events/img/diwali-mini.png'
  'dubai-world-cup' = '/en/content/categories/sport/horse-racing/events/img/dubai-world-cup-mini.png'
  'fiji-day' = '/en/content/categories/culture/national-day/events/img/fiji-day-mini.png'
  'hajj-2026' = '/en/content/categories/culture/religion/events/img/hajj-mini.png'
  'icc-t20-world-cup-2026' = '/en/content/categories/sport/cricket/events/img/icc-t20-world-cup-mini.png'
  'ipl-final-2026' = '/en/content/categories/sport/cricket/events/img/ipl-final-mini.png'
  'melbourne-cup' = '/en/content/categories/sport/horse-racing/events/img/melbourne-cup-mini.png'
  'motogp-japan' = '/en/content/categories/sport/motogp/events/img/motogp-japan-mini.png'
  'nrl-grand-final' = '/en/content/categories/sport/rugby/events/img/nrl-grand-final-mini.png'
  'qatar-grand-prix' = '/en/content/categories/sport/formula-1/events/img/qatar-grand-prix-mini.png'
  'queenstown-winter-festival' = '/en/content/categories/culture/winter/events/img/queenstown-winter-festival-mini.png'
  'seoul-lantern-festival' = '/en/content/categories/culture/tradition/events/img/seoul-lantern-festival-mini.png'
  'singapore-grand-prix' = '/en/content/categories/sport/formula-1/events/img/singapore-grand-prix-mini.png'
  'state-of-origin' = '/en/content/categories/sport/rugby/events/img/state-of-origin-mini.png'
  'sydney-marathon' = '/en/content/categories/sport/running/events/img/sydney-marathon-mini.png'
  'sydney-new-years-eve' = '/en/content/categories/culture/tradition/events/img/sydney-new-years-eve-mini.png'
  'vivid-sydney' = '/en/content/categories/culture/art/events/img/vivid-sydney-mini.png'
  'yi-peng-and-loy-krathong' = '/en/content/categories/culture/tradition/events/img/yi-peng-and-loy-krathong-mini.png'
}

function Get-DataBlock($scriptName, $functionName) {
  $sourceScript = Join-Path $repoRoot $scriptName
  $sourceText = [System.IO.File]::ReadAllText($sourceScript, [System.Text.Encoding]::UTF8)
  $markerIndex = $sourceText.IndexOf("function $functionName")
  if ($markerIndex -lt 0) { throw "Could not find $functionName in $sourceScript" }
  return $sourceText.Substring(0, $markerIndex)
}

Invoke-Expression (Get-DataBlock 'rebuild-asia-countries.ps1' 'Build-AsiaPage')
$AsiaData = $CD.Clone()
Invoke-Expression (Get-DataBlock 'rebuild-oceania-countries.ps1' 'Build-OcPage')
$OceaniaData = $CD.Clone()
$locRoot = Join-Path $repoRoot 'content\locations'

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
  return ((Normalize-Text $value) -replace '\s*\|\s*OneSliders.*$', '').Trim()
}

function Title-FromSlug($slug) {
  return (([string]$slug) -split '-' | ForEach-Object {
    if ($_ -eq 'usa') { 'USA' } else { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }
  }) -join ' '
}

function First-Match($html, $pattern) {
  $m = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return ''
}

function Get-CountryNames($continentSlug) {
  $names = @{}
  Get-ChildItem (Join-Path $locRoot $continentSlug) -Directory | ForEach-Object {
    $file = Join-Path $_.FullName 'index.html'
    $title = ''
    if (Test-Path $file) {
      $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
      $title = Clean-Title (First-Match $html '<title>([^<]+)</title>')
    }
    if (-not $title) { $title = Title-FromSlug $_.Name }
    $names[$_.Name] = $title
  }
  return $names
}

$AsiaNames = Get-CountryNames 'asia'
$OceaniaNames = Get-CountryNames 'oceania'

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
  return @{ FoodSlug = 'street-food'; FoodTitle = 'Street food'; DrinkSlug = 'tea'; DrinkTitle = 'Tea' }
}

function Get-EventImage($href, $continentSlug) {
  $clean = ([string]$href) -split '#', 2 | Select-Object -First 1
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($clean)
  if ($EventImageBySlug.ContainsKey($slug)) { return $EventImageBySlug[$slug] }
  return "/content/locations/$continentSlug/img/$continentSlug-mini.png"
}

function Get-EventEndDate($label) {
  $yearMatch = [regex]::Match($label, '(20\d{2})')
  $year = if ($yearMatch.Success) { $yearMatch.Groups[1].Value } else { '2026' }
  $monthMatches = [regex]::Matches($label, 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec')
  if ($monthMatches.Count -eq 0) { return "$year-12-31" }
  $month = $monthMatches[$monthMatches.Count - 1].Value
  $ends = @{
    Jan = '01-31'; Feb = '02-28'; Mar = '03-31'; Apr = '04-30'; May = '05-31'; Jun = '06-30'
    Jul = '07-31'; Aug = '08-31'; Sep = '09-30'; Oct = '10-31'; Nov = '11-30'; Dec = '12-31'
  }
  return "$year-$($ends[$month])"
}

function Build-GroupHtml($slug, $groups, $names) {
  $countryGroups = @($groups | Where-Object { $_.Slugs -contains $slug })
  if ($countryGroups.Count -eq 0) { return '' }
  $out = '<div class="country-left-stack"><div class="country-panel-card"><h2>Part of</h2><div class="country-group-list">'
  foreach ($group in $countryGroups) {
    $out += '<div class="country-group"><strong>' + (Html $group.Label) + '</strong><div class="country-chip-row">'
    foreach ($member in $group.Slugs) {
      $name = $names[$member]
      if (-not $name) { $name = Title-FromSlug $member }
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

function Build-EventCards($events, $countryTitle, $continentSlug) {
  if ($events.Count -eq 0) {
    return '<p class="country-empty">No future ' + (Html $countryTitle) + '-linked events are active in the current dataset.</p>'
  }
  $out = ''
  foreach ($event in $events) {
    $href = Html $event.Href
    $date = Html $event.Date
    $title = Html $event.Title
    $img = Html (Get-EventImage $event.Href $continentSlug)
    $end = Html (Get-EventEndDate $event.Date)
    $cardClass = if ($event.Href -match '/culture/') { 'visual-topic-card visual-topic-card--national' } else { 'visual-topic-card visual-topic-card--music' }
    $out += '<a class="' + $cardClass + '" data-end="' + $end + '" href="' + $href + '"><img src="' + $img + '" alt="" loading="lazy"><strong>' + $title + '</strong><span>' + $date + ' &middot; ' + (Html $countryTitle) + '</span></a>'
  }
  return $out
}

function Build-TopicCards($slug, $continentSlug, $continentTitle) {
  $secondHref = '../../../categories/nature/index.html'
  $secondTitle = "$continentTitle outdoors"
  $secondText = 'Landscapes, routes, seasons and protected nature.'

  $marineAsia = @('bahrain', 'brunei', 'indonesia', 'japan', 'malaysia', 'maldives', 'oman', 'philippines', 'qatar', 'singapore', 'sri-lanka', 'taiwan', 'thailand', 'timor-leste', 'united-arab-emirates', 'vietnam', 'yemen')
  $mountainAsia = @('afghanistan', 'bhutan', 'india', 'kazakhstan', 'kyrgyzstan', 'mongolia', 'nepal', 'pakistan', 'tajikistan')
  $pacific = @('fiji', 'kiribati', 'marshall-islands', 'micronesia', 'nauru', 'palau', 'papua-new-guinea', 'samoa', 'solomon-islands', 'tonga', 'tuvalu', 'vanuatu')

  if ($continentSlug -eq 'asia' -and ($marineAsia -contains $slug)) {
    $secondHref = '../../../categories/climate/marine.html'
    $secondTitle = 'Coasts and islands'
    $secondText = 'Marine calendars, islands, reefs and coastal travel timing.'
  } elseif ($continentSlug -eq 'asia' -and ($mountainAsia -contains $slug)) {
    $secondHref = '../../../categories/climate/protected-nature.html'
    $secondTitle = 'Mountains and routes'
    $secondText = 'Highland landscapes, trekking windows and protected nature.'
  } elseif ($continentSlug -eq 'oceania' -and ($pacific -contains $slug)) {
    $secondHref = '../../../categories/climate/marine.html'
    $secondTitle = 'Pacific islands'
    $secondText = 'Reefs, lagoons, island seasons and ocean-linked events.'
  }

  return '<div class="country-paths country-paths--topics"><a class="visual-topic-card visual-topic-card--music" href="../../../categories/music/index.html"><img src="/en/content/categories/music/song-contests/events/img/eurovision-song-contest-mini.png" alt="" loading="lazy"><strong>Music &amp; Culture</strong><span>Festivals, concerts and cultural calendars.</span></a><a class="visual-topic-card visual-topic-card--national" href="' + $secondHref + '"><img src="/content/locations/' + $continentSlug + '/img/' + $continentSlug + '-mini.png" alt="" loading="lazy"><strong>' + (Html $secondTitle) + '</strong><span>' + (Html $secondText) + '</span></a></div>'
}

function Build-CountryOnePage($filePath, $continentSlug, $continentTitle, $data, $groups, $names) {
  $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
  $rel = $filePath.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Length -ne 3 -or $parts[0] -ne $continentSlug -or $parts[2] -ne 'index.html') { return $null }

  $slug = $parts[1]
  $d = $data[$slug]
  if (-not $d) { Write-Host "  SKIP (no data): $rel"; return $null }

  $title = $names[$slug]
  if (-not $title) { $title = Clean-Title (First-Match $html '<title>([^<]+)</title>') }
  if (-not $title) { $title = Title-FromSlug $slug }

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
  if (Test-Path $heroPath) {
    $heroUrl = "/content/locations/$continentSlug/$slug/img/$slug-hero.png"
  } else {
    $heroUrl = "/content/locations/$continentSlug/img/$continentSlug-hero.jpg"
  }
  $heroStyle = ' style="--country-hero-url: url(''' + $heroUrl + ''')"'

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

  $groupHtml = Build-GroupHtml $slug $groups $names
  $cityPaths = Build-CityPaths $cities
  $eventCards = Build-EventCards $events $title $continentSlug
  $topicCards = Build-TopicCards $slug $continentSlug $continentTitle
  $cssVersion = "country-onepage-$continentSlug-20260527"

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
  <link rel="stylesheet" href="../../../../assets/css/locations.css?v=$cssVersion">
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
    <a class="nav-back" href="../index.html" title="Back to $continentTitle" aria-label="Back to $continentTitle">$BACK_ICON<span>$continentTitle</span></a>
    <a class="nav-pill" href="../index.html">$continentTitle</a>
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

  return $HEAD + "`n" + $NAV + "`n" + $BODY
}

function Convert-Continent($continentSlug, $continentTitle, $data, $groups, $names) {
  $files = Get-ChildItem (Join-Path $locRoot $continentSlug) -Recurse -Filter 'index.html' | Where-Object {
    $rel = $_.FullName.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    $parts.Length -eq 3
  }

  $converted = 0
  $skipped = 0
  $errors = 0

  foreach ($file in $files) {
    try {
      $result = Build-CountryOnePage $file.FullName $continentSlug $continentTitle $data $groups $names
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

  return [pscustomobject]@{ Continent = $continentTitle; Converted = $converted; Skipped = $skipped; Errors = $errors }
}

$asiaResult = Convert-Continent 'asia' 'Asia' $AsiaData $AsiaGroups $AsiaNames
$oceaniaResult = Convert-Continent 'oceania' 'Oceania' $OceaniaData $OceaniaGroups $OceaniaNames

Write-Host ''
Write-Host '=== DONE ==='
$asiaResult
$oceaniaResult

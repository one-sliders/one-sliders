$locRoot = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"

$contMap = @{
    'africa'        = 'Africa'
    'antarctica'    = 'Antarctica'
    'asia'          = 'Asia'
    'europe'        = 'Europe'
    'north-america' = 'North America'
    'oceania'       = 'Oceania'
    'south-america' = 'South America'
}

$ICONS_EVENTS  = '<a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
$ICONS_WORLD   = '<a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
$ICONS_CAT     = '<a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
$BACK_ICON     = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'

function Strip-Tags($s) { [regex]::Replace($s, '<[^>]+>', '') }

function Get-Facts($html) {
    $d = [ordered]@{}
    $ms = [regex]::Matches($html, '<div class="fact"><span>([^<]+)</span><strong>((?:<a[^>]*>)?[^<]+(?:</a>)?)</strong></div>')
    foreach ($m in $ms) {
        $k = $m.Groups[1].Value.Trim()
        $v = $m.Groups[2].Value.Trim()
        if (-not $d.Contains($k)) { $d[$k] = $v }
    }
    return $d
}

function Build-FactRows($facts) {
    $rows = ""
    foreach ($k in $facts.Keys) {
        $rows += "          <div class=`"fact-row`"><span>$k</span><strong>$($facts[$k])</strong></div>`n"
    }
    return $rows
}

function Build-HeroStat($label, $value) {
    if (-not $value) { return "" }
    return "          <div class=`"hero-stat`"><span>$label</span><strong>$value</strong></div>`n"
}

function Build-Page($filePath) {
    $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    # Skip already converted
    if ($html -match 'oneslider-mockup\.css') { return $null }

    $rel   = $filePath.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    if ($parts.Length -ne 3) { return $null }

    $contSlug    = $parts[0]
    $countrySlug = $parts[1]
    $fileName    = $parts[2]
    $isCountry   = ($fileName -eq "index.html")

    $contName = if ($contMap.ContainsKey($contSlug)) { $contMap[$contSlug] } else { (Get-Culture).TextInfo.ToTitleCase($contSlug.Replace('-',' ')) }

    # Common extractions
    $title    = [regex]::Match($html, '<title>([^<]+)</title>').Groups[1].Value.Trim()
    $eyebrow  = [regex]::Match($html, 'class="eyebrow">([^<]+)<').Groups[1].Value.Trim()
    $introRaw = [regex]::Match($html, 'class="intro">(.+?)</p>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $intro    = if ($introRaw.Success) { Strip-Tags($introRaw.Groups[1].Value.Trim()) } else { $title }
    $heroImg  = [regex]::Match($html, "url\('(https?://[^']+)'\)").Groups[1].Value
    $knownFor = [regex]::Match($html, 'Known for</span>([^<]+)').Groups[1].Value.Trim()
    $facts    = Get-Facts $html

    $heroStyle = if ($heroImg) {
        "background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%),url('$heroImg')"
    } else {
        "background:linear-gradient(135deg,#0d2137,#1a5c8a)"
    }

    # Events
    $evtMs = [regex]::Matches($html, 'class="event-link" href="([^"]+)"[^>]*>.*?<span>([^<]+)</span>.*?<strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $evtCards = ""
    foreach ($m in $evtMs) {
        $evtCards += "          <a class=`"event-card`" href=`"$($m.Groups[1].Value)`"><div class=`"event-body`"><span class=`"event-date`">$($m.Groups[2].Value.Trim())</span><strong>$($m.Groups[3].Value.Trim())</strong></div></a>`n"
    }

    $factRows = Build-FactRows $facts

    $knownSection = if ($knownFor) {
        "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">About $title</h2>`n        <p class=`"hero-text`" style=`"padding:12px 0`">$knownFor</p>`n      </article>`n"
    } else { "" }

    $evtSection = if ($evtCards) {
        "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Upcoming Events</h2>`n        <div class=`"event-strip`">`n$evtCards        </div>`n      </article>`n"
    } else { "" }

    $factSection = if ($factRows) {
        "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">Key Facts</h2>`n        <div class=`"fact-table`">`n$factRows        </div>`n      </article>`n"
    } else { "" }

    $HEAD = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../assets/css/oneslider-mockup.css">
  <meta name="theme-color" content="#0d2137">
  <title>$title</title>
</head>
<body>
"@

    if ($isCountry) {
        if (-not $eyebrow) { $eyebrow = "Country in $contName" }

        $heroStats  = (Build-HeroStat "Capital"    ($facts["Capital city"]))
        $heroStats += (Build-HeroStat "Language"   ($facts["Language"]))
        $heroStats += (Build-HeroStat "Currency"   ($facts["Currency"]))
        $heroStats += (Build-HeroStat "Population" ($facts["Population"]))

        # City links
        $cityMs = [regex]::Matches($html, 'class="city-link" href="([^"]+)"[^>]*>.*?<strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $cityCards = ""
        foreach ($m in $cityMs) {
            $cityCards += "          <a class=`"mini-tile`" href=`"$($m.Groups[1].Value)`"><strong>$($m.Groups[2].Value.Trim())</strong></a>`n"
        }
        $citySection = if ($cityCards) {
            "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Cities</h2>`n        <div class=`"mini-grid`">`n$cityCards        </div>`n      </article>`n"
        } else { "" }

        $NAV = @"
  <nav class="top-menu" aria-label="Location navigation">
    $ICONS_EVENTS
    $ICONS_WORLD
    $ICONS_CAT
    <span class="nav-divider"></span>
    <a class="nav-back" href="../index.html" title="Back to $contName" aria-label="Back to $contName">$BACK_ICON<span>$contName</span></a>
    <a class="nav-pill" href="../index.html">$contName</a>
    <a class="nav-pill active" aria-current="page" href="index.html">$title</a>
  </nav>
"@

        $BODY = @"
  <main class="page-shell">
    <section class="hero-card" style="$heroStyle">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="kicker">$eyebrow</p>
          <h1 class="hero-title">$title</h1>
          <p class="hero-text">$intro</p>
        </div>
        <div class="hero-stats">
$heroStats        </div>
      </div>
    </section>

    <section class="dashboard-grid" aria-label="$title overview">
$factSection$knownSection$citySection$evtSection    </section>
  </main>

  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. Updated May 2026.</footer>
</body>
</html>
"@
        return $HEAD + $NAV + $BODY

    } else {
        # City page
        $countryName = [regex]::Match($html, 'href="index\.html"[^>]*>([^<]+)</a>').Groups[1].Value.Trim()
        if (-not $countryName) { $countryName = (Get-Culture).TextInfo.ToTitleCase($countrySlug.Replace('-',' ')) }
        if (-not $eyebrow) { $eyebrow = "City in $countryName" }

        $heroStats  = (Build-HeroStat "Country"    ($facts["Country"]))
        $heroStats += (Build-HeroStat "Population" ($facts["City population"]))
        $heroStats += (Build-HeroStat "Metro"      ($facts["Metro population"]))
        $heroStats += (Build-HeroStat "Role"       ($facts["City ranking"]))

        $NAV = @"
  <nav class="top-menu" aria-label="Location navigation">
    $ICONS_EVENTS
    $ICONS_WORLD
    $ICONS_CAT
    <span class="nav-divider"></span>
    <a class="nav-back" href="index.html" title="Back to $countryName" aria-label="Back to $countryName">$BACK_ICON<span>$countryName</span></a>
    <a class="nav-pill" href="../index.html">$contName</a>
    <a class="nav-pill" href="index.html">$countryName</a>
    <a class="nav-pill active" aria-current="page" href="$fileName">$title</a>
  </nav>
"@

        $BODY = @"
  <main class="page-shell">
    <section class="hero-card" style="$heroStyle">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="kicker">$eyebrow</p>
          <h1 class="hero-title">$title</h1>
          <p class="hero-text">$intro</p>
        </div>
        <div class="hero-stats">
$heroStats        </div>
      </div>
    </section>

    <section class="dashboard-grid" aria-label="$title overview">
$factSection$knownSection$evtSection    </section>
  </main>

  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. Updated May 2026.</footer>
</body>
</html>
"@
        return $HEAD + $NAV + $BODY
    }
}

# Find all HTML files at exactly depth 3 from locRoot (continent/country/file.html)
$files = Get-ChildItem -Path $locRoot -Filter "*.html" -Recurse | Where-Object {
    $rel   = $_.FullName.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    $parts.Length -eq 3
}

$converted = 0
$skipped   = 0
$errors    = 0

foreach ($f in $files) {
    try {
        $result = Build-Page $f.FullName
        if ($result) {
            [System.IO.File]::WriteAllText($f.FullName, $result, (New-Object System.Text.UTF8Encoding $false))
            $converted++
        } else {
            $skipped++
        }
    } catch {
        Write-Host "ERROR: $($f.FullName.Substring($locRoot.Length + 1)) - $_"
        $errors++
    }
}

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Converted : $converted"
Write-Host "Skipped   : $skipped (already new format)"
Write-Host "Errors    : $errors"

#Requires -Version 5.1
# rebuild-continents.ps1
# Rewrites 6 continent index.html pages to match the Europe page structure.
# UTF-8 without BOM.

$base = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"

# ── helper: write UTF-8 no-BOM ────────────────────────────────────────────────
function Write-Utf8NoBom([string]$path, [string]$content) {
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $content, $enc)
}

# ── helper: extract hero image URL from existing file ─────────────────────────
function Get-HeroUrl([string]$file) {
    $raw = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    $m = [regex]::Match($raw, "url\('(https://[^']+)'\)")
    if ($m.Success) { return $m.Groups[1].Value }
    return ""
}

# ── helper: build pill-row from subfolders ────────────────────────────────────
function Build-PillRow([string]$continentDir) {
    $pills = @()
    Get-ChildItem -LiteralPath $continentDir -Directory | Sort-Object Name | ForEach-Object {
        $slug = $_.Name
        $flagPath = Join-Path $_.FullName "img\flag.svg"
        $indexPath = Join-Path $_.FullName "index.html"
        if ((Test-Path $flagPath) -and (Test-Path $indexPath)) {
            $raw = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
            $tm = [regex]::Match($raw, '<title>([^<]+)</title>')
            $name = if ($tm.Success) { $tm.Groups[1].Value.Trim() } else { $slug }
            $pills += "<a class=`"pill`" href=`"$slug/index.html`"><img src=`"$slug/img/flag.svg`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$name</span></a>"
        }
    }
    return $pills -join ""
}

# ── helper: build a continent page ───────────────────────────────────────────
function Build-Page {
    param(
        [string]$Title,
        [string]$HeroUrl,
        [string]$HeroText,
        [hashtable[]]$HeroStats,          # @{Label;Value}
        [hashtable[]]$Overview,           # @{Label;Value}
        [hashtable[]]$KeyStats,           # @{Label;Value;Pct}
        [string]$Top5Title,
        [hashtable[]]$Top5,               # @{Label;Value;Pct}
        [hashtable[]]$Landscape,          # @{Value;Label}
        [hashtable[]]$Mountains,          # @{Name;Height}
        [hashtable[]]$Regions,            # @{Label;Text}
        [string]$WhyTitle,
        [hashtable[]]$Why,                # @{Title;Text}
        [string]$CountriesHtml,           # pre-built countries section inner html
        [string]$ActiveSlug,              # e.g. "africa"
        [string]$NavPillsHtml
    )

    # hero stats
    $heroStatsHtml = ""
    foreach ($s in $HeroStats) {
        $heroStatsHtml += "          <div class=`"hero-stat`"><span>$($s.Label)</span><strong>$($s.Value)</strong></div>`n"
    }

    # overview rows
    $overviewHtml = ""
    foreach ($r in $Overview) {
        $overviewHtml += "          <div class=`"fact-row`"><span>$($r.Label)</span><strong>$($r.Value)</strong></div>`n"
    }

    # key stats bars
    $keyStatsHtml = ""
    foreach ($r in $KeyStats) {
        $keyStatsHtml += "          <div class=`"bar-row`"><span>$($r.Label)</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($r.Pct)`"></i></div><strong>$($r.Value)</strong></div>`n"
    }

    # top 5 bars
    $top5Html = ""
    foreach ($r in $Top5) {
        $top5Html += "          <div class=`"bar-row`"><span>$($r.Label)</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($r.Pct)`"></i></div><strong>$($r.Value)</strong></div>`n"
    }

    # landscape metrics
    $landscapeHtml = ""
    foreach ($m in $Landscape) {
        $landscapeHtml += "          <div class=`"metric`"><strong>$($m.Value)</strong><span>$($m.Label)</span></div>`n"
    }

    # mountain mini-tiles
    $mountainsHtml = ""
    foreach ($mt in $Mountains) {
        $mountainsHtml += "          <div class=`"mini-tile`"><div class=`"mini-photo`" style=`"background-image:linear-gradient(180deg,rgba(14,52,70,.02),rgba(14,52,70,.38)),url('$HeroUrl')`"></div><strong>$($mt.Name)</strong><span>$($mt.Height)</span></div>`n"
    }

    # regions info-chips
    $regionsHtml = ""
    foreach ($r in $Regions) {
        $regionsHtml += "          <div class=`"info-chip`"><span>$($r.Label)</span><strong>$($r.Text)</strong></div>`n"
    }

    # why icon-tiles
    $whyHtml = ""
    foreach ($w in $Why) {
        $whyHtml += "          <div class=`"icon-tile`"><strong>$($w.Title)</strong><span>$($w.Text)</span></div>`n"
    }

    $html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../assets/css/oneslider-mockup.css">
  <meta name="theme-color" content="#0d2137">
  <title>$Title</title>
</head>
<body>
  <nav class="top-menu" aria-label="Continents">
    <a class="nav-icon" href="../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon active" href="../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a class="nav-back" href="../../locations/index.html" title="Back to World" aria-label="Back to World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>World</span></a>
$NavPillsHtml
  </nav>

  <main class="page-shell">
    <section class="hero-card" style="background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%),url('$HeroUrl')">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="kicker">Continent</p>
          <h1 class="hero-title">$Title</h1>
          <p class="hero-text">$HeroText</p>
        </div>
        <div class="hero-stats">
$heroStatsHtml        </div>
      </div>
    </section>

    <section class="dashboard-grid" aria-label="$Title overview">
      <article class="card span-6">
        <h2 class="card-title">Overview</h2>
        <div class="fact-table">
$overviewHtml        </div>
      </article>

      <article class="card span-6">
        <h2 class="card-title">Key Stats</h2>
        <div class="bar-list">
$keyStatsHtml        </div>
        <p class="source-line">Sources: UN, World Bank, Numbeo.</p>
      </article>

      <article class="card span-6">
        <h2 class="card-title">$Top5Title</h2>
        <div class="bar-list">
$top5Html        </div>
      </article>

      <article class="card span-6">
        <h2 class="card-title">Landscape &amp; Nature</h2>
        <div class="metric-strip">
$landscapeHtml        </div>
      </article>

      <article class="card span-5">
        <h2 class="card-title">Top 3 Highest Mountains</h2>
        <div class="mini-grid">
$mountainsHtml        </div>
      </article>

      <article class="card span-7">
        <h2 class="card-title">Regions</h2>
        <div class="two-list">
$regionsHtml        </div>
      </article>

      <article class="card span-12">
        <h2 class="card-title">$WhyTitle</h2>
        <div class="icon-grid">
$whyHtml        </div>
      </article>

      <article class="card span-12">
        <h2 class="card-title">Countries</h2>
$CountriesHtml      </article>
    </section>
  </main>

  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. Updated May 2026.</footer>
</body>
</html>
"@
    return $html
}

# ── nav pills builder ─────────────────────────────────────────────────────────
function Build-NavPills([string]$active) {
    $continents = @(
        @{ slug="africa";        label="Africa";      href="../africa/index.html" }
        @{ slug="antarctica";    label="Antarctica";  href="../antarctica/index.html" }
        @{ slug="asia";          label="Asia";        href="../asia/index.html" }
        @{ slug="europe";        label="Europe";      href="../europe/index.html" }
        @{ slug="north-america"; label="N. America";  href="../north-america/index.html" }
        @{ slug="oceania";       label="Oceania";     href="../oceania/index.html" }
        @{ slug="south-america"; label="S. America";  href="../south-america/index.html" }
    )
    $html = ""
    foreach ($c in $continents) {
        if ($c.slug -eq $active) {
            $href = "index.html"
            $html += "    <a class=`"nav-pill active`" aria-current=`"page`" href=`"$href`">$($c.label)</a>`n"
        } else {
            $html += "    <a class=`"nav-pill`" href=`"$($c.href)`">$($c.label)</a>`n"
        }
    }
    return $html.TrimEnd()
}

# ── pill row wrapper ──────────────────────────────────────────────────────────
function Wrap-PillRow([string]$innerHtml) {
    return "        <div class=`"pill-row`">`n          $innerHtml`n        </div>`n"
}

$written = 0

# ════════════════════════════════════════════════════════════════════════════════
# 1. AFRICA
# ════════════════════════════════════════════════════════════════════════════════
$slug = "africa"
$dir = "$base\$slug"
$heroUrl = Get-HeroUrl "$dir\index.html"

$pillsHtmlAfrica = ""
Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name | ForEach-Object {
    $s = $_.Name
    $fp = Join-Path $_.FullName "img\flag.svg"
    $ip = Join-Path $_.FullName "index.html"
    if ((Test-Path $fp) -and (Test-Path $ip)) {
        $raw = [System.IO.File]::ReadAllText($ip, [System.Text.Encoding]::UTF8)
        $tm = [regex]::Match($raw, '<title>([^<]+)</title>')
        $cn = if ($tm.Success) { $tm.Groups[1].Value.Trim() } else { $s }
        $pillsHtmlAfrica += "<a class=`"pill`" href=`"$s/index.html`"><img src=`"$s/img/flag.svg`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$cn</span></a>"
    }
}
$africaCountries = "        <div class=`"pill-row`">`n          $pillsHtmlAfrica`n        </div>`n"

$africaPage = Build-Page `
    -Title "Africa" `
    -HeroUrl $heroUrl `
    -HeroText "The world&#x2019;s second-largest continent &#x2014; vast savannas, Sahara sands, rainforest basins and a rapidly growing, youthful population." `
    -HeroStats @(
        @{Label="Countries"; Value="54"}
        @{Label="Population"; Value="1.46B"}
        @{Label="Area"; Value="30.4M km2"}
        @{Label="Known for"; Value="Wildlife, nature, culture"}
    ) `
    -Overview @(
        @{Label="Area"; Value="30.4 million km2"}
        @{Label="Population"; Value="1.46 billion"}
        @{Label="Population ranking"; Value="#2"}
        @{Label="Share of world population"; Value="18%"}
        @{Label="Countries"; Value="54"}
        @{Label="Largest country (by area)"; Value="Algeria"}
        @{Label="Smallest country"; Value="Seychelles"}
        @{Label="Time zones"; Value="UTC -1 to +4"}
    ) `
    -KeyStats @(
        @{Label="Human development"; Pct="56%"; Value="Medium"}
        @{Label="Safety index"; Pct="48%"; Value="48"}
        @{Label="Internet access"; Pct="43%"; Value="43%"}
        @{Label="Life expectancy"; Pct="66%"; Value="64 years"}
        @{Label="GDP nominal"; Pct="20%"; Value="`$2.8T"}
    ) `
    -Top5Title "Top 5 Countries by Population" `
    -Top5 @(
        @{Label="Nigeria"; Pct="100%"; Value="220M"}
        @{Label="Ethiopia"; Pct="58%"; Value="127M"}
        @{Label="Egypt"; Pct="49%"; Value="107M"}
        @{Label="DR Congo"; Pct="45%"; Value="100M"}
        @{Label="Tanzania"; Pct="30%"; Value="65M"}
    ) `
    -Landscape @(
        @{Value="5,895 m"; Label="Highest point"}
        @{Value="22%"; Label="Forest cover"}
        @{Value="30,500 km"; Label="Coastline"}
        @{Value="6"; Label="Climate zones"}
    ) `
    -Mountains @(
        @{Name="Kilimanjaro"; Height="5,895 m"}
        @{Name="Mount Kenya"; Height="5,199 m"}
        @{Name="Margherita Peak"; Height="5,109 m"}
    ) `
    -Regions @(
        @{Label="North"; Text="Sahara, Nile valley, Mediterranean coast and Arab connections"}
        @{Label="West"; Text="Atlantic coastlines, rainforest belt, major cities and young economies"}
        @{Label="East"; Text="Rift Valley, Ethiopian highlands, Horn of Africa and Indian Ocean islands"}
        @{Label="South"; Text="Savanna, Cape coastlines, mineral wealth and wildlife reserves"}
    ) `
    -WhyTitle "Why Africa?" `
    -Why @(
        @{Title="Wildlife"; Text="World&#x2019;s largest concentrations of big game &#x2014; Serengeti, Okavango and Kruger."}
        @{Title="Ancient history"; Text="Egypt, Great Zimbabwe, Timbuktu and the cradle of humankind."}
        @{Title="Diverse landscapes"; Text="Sahara, rainforests, rift lakes, volcanoes and vast coastlines."}
        @{Title="Youngest population"; Text="Fastest-growing continent with rising cities and mobile-first economies."}
        @{Title="Vibrant cultures"; Text="Thousands of languages, music traditions, festivals and cuisines."}
    ) `
    -CountriesHtml $africaCountries `
    -ActiveSlug $slug `
    -NavPillsHtml (Build-NavPills $slug)

Write-Utf8NoBom "$dir\index.html" $africaPage
$written++
Write-Host "Written: africa/index.html"

# ════════════════════════════════════════════════════════════════════════════════
# 2. ANTARCTICA
# ════════════════════════════════════════════════════════════════════════════════
$slug = "antarctica"
$dir = "$base\$slug"
$heroUrl = Get-HeroUrl "$dir\index.html"

$antarcticaCountries = "        <p class=`"hero-text`" style=`"padding:12px 0`">Antarctica has no sovereign nations. It is governed by the Antarctic Treaty System, signed in 1959 by 56 nations.</p>`n"

$antarcticaPage = Build-Page `
    -Title "Antarctica" `
    -HeroUrl $heroUrl `
    -HeroText "Earth&#x2019;s southernmost and most remote continent &#x2014; perpetual ice, polar science and extreme natural conditions unlike anywhere else." `
    -HeroStats @(
        @{Label="Area"; Value="14.2M km2"}
        @{Label="Ice cover"; Value="98%"}
        @{Label="Research stations"; Value="70+"}
        @{Label="Coldest recorded"; Value="-89.2&#x00B0;C"}
    ) `
    -Overview @(
        @{Label="Area"; Value="14.2 million km2"}
        @{Label="Permanent residents"; Value="None"}
        @{Label="Research staff"; Value="1,000&#x2013;5,000 (seasonal)"}
        @{Label="Territorial claims"; Value="7"}
        @{Label="Coldest recorded"; Value="-89.2&#x00B0;C"}
        @{Label="Average elevation"; Value="2,300 m"}
        @{Label="Ice thickness"; Value="up to 4.8 km"}
        @{Label="Discovered"; Value="1820"}
    ) `
    -KeyStats @(
        @{Label="Ice coverage"; Pct="98%"; Value="98%"}
        @{Label="Annual precipitation"; Pct="20%"; Value="160&#x2013;200 mm"}
        @{Label="Wind speed avg"; Pct="75%"; Value="97 km/h"}
        @{Label="Research stations"; Pct="70%"; Value="70+"}
        @{Label="Treaty nations"; Pct="60%"; Value="56 signatories"}
    ) `
    -Top5Title "Top 5 Research Nations" `
    -Top5 @(
        @{Label="USA"; Pct="100%"; Value="100%"}
        @{Label="Russia"; Pct="90%"; Value="90%"}
        @{Label="Argentina"; Pct="80%"; Value="80%"}
        @{Label="Australia"; Pct="70%"; Value="70%"}
        @{Label="UK"; Pct="60%"; Value="60%"}
    ) `
    -Landscape @(
        @{Value="4,892 m"; Label="Highest point (Vinson)"}
        @{Value="98%"; Label="Ice covered"}
        @{Value="17,968 km"; Label="Coastline"}
        @{Value="1"; Label="Climate zone (polar)"}
    ) `
    -Mountains @(
        @{Name="Vinson Massif"; Height="4,892 m"}
        @{Name="Mount Tyree"; Height="4,852 m"}
        @{Name="Mount Shinn"; Height="4,661 m"}
    ) `
    -Regions @(
        @{Label="Peninsula"; Text="Antarctic Peninsula &#x2014; most visited area, wildlife colonies and research stations"}
        @{Label="West"; Text="West Antarctic ice sheet &#x2014; dynamic, thinner ice and volcanic activity"}
        @{Label="East"; Text="East Antarctic plateau &#x2014; oldest ice cores and extreme cold records"}
        @{Label="Ross Sea"; Text="Ross Ice Shelf, McMurdo Sound and key gateway to the interior"}
    ) `
    -WhyTitle "Why Antarctica?" `
    -Why @(
        @{Title="Polar wilderness"; Text="The most remote and pristine environment on Earth &#x2014; untouched ice and silence."}
        @{Title="Unique wildlife"; Text="Emperor penguins, leopard seals, albatrosses and Antarctic krill ecosystems."}
        @{Title="Climate science"; Text="Ice cores hold 800,000 years of atmospheric and climate history."}
        @{Title="Midnight sun"; Text="Continuous daylight in summer months across endless white horizons."}
        @{Title="Extreme adventure"; Text="The ultimate expedition destination &#x2014; from research visits to polar crossings."}
    ) `
    -CountriesHtml $antarcticaCountries `
    -ActiveSlug $slug `
    -NavPillsHtml (Build-NavPills $slug)

Write-Utf8NoBom "$dir\index.html" $antarcticaPage
$written++
Write-Host "Written: antarctica/index.html"

# ════════════════════════════════════════════════════════════════════════════════
# 3. ASIA
# ════════════════════════════════════════════════════════════════════════════════
$slug = "asia"
$dir = "$base\$slug"
$heroUrl = Get-HeroUrl "$dir\index.html"

$pillsHtmlAsia = ""
Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name | ForEach-Object {
    $s = $_.Name
    $fp = Join-Path $_.FullName "img\flag.svg"
    $ip = Join-Path $_.FullName "index.html"
    if ((Test-Path $fp) -and (Test-Path $ip)) {
        $raw = [System.IO.File]::ReadAllText($ip, [System.Text.Encoding]::UTF8)
        $tm = [regex]::Match($raw, '<title>([^<]+)</title>')
        $cn = if ($tm.Success) { $tm.Groups[1].Value.Trim() } else { $s }
        $pillsHtmlAsia += "<a class=`"pill`" href=`"$s/index.html`"><img src=`"$s/img/flag.svg`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$cn</span></a>"
    }
}
$asiaCountries = "        <div class=`"pill-row`">`n          $pillsHtmlAsia`n        </div>`n"

$asiaPage = Build-Page `
    -Title "Asia" `
    -HeroUrl $heroUrl `
    -HeroText "The world&#x2019;s largest and most populous continent &#x2014; ancient civilisations, towering mountain ranges, megacities and extraordinary cultural diversity." `
    -HeroStats @(
        @{Label="Countries"; Value="44"}
        @{Label="Population"; Value="4.7B"}
        @{Label="Area"; Value="44.6M km2"}
        @{Label="Known for"; Value="Himalayas, megacities, culture"}
    ) `
    -Overview @(
        @{Label="Area"; Value="44.6 million km2"}
        @{Label="Population"; Value="4.7 billion"}
        @{Label="Population ranking"; Value="#1"}
        @{Label="Share of world population"; Value="59%"}
        @{Label="Countries"; Value="44"}
        @{Label="Largest country"; Value="China"}
        @{Label="Smallest country"; Value="Maldives"}
        @{Label="Time zones"; Value="UTC +2 to +12"}
    ) `
    -KeyStats @(
        @{Label="Human development"; Pct="72%"; Value="High"}
        @{Label="Safety index"; Pct="55%"; Value="55"}
        @{Label="Internet access"; Pct="64%"; Value="64%"}
        @{Label="Life expectancy"; Pct="78%"; Value="74 years"}
        @{Label="GDP nominal"; Pct="95%"; Value="`$36T"}
    ) `
    -Top5Title "Top 5 Countries by Population" `
    -Top5 @(
        @{Label="China"; Pct="100%"; Value="1,410M"}
        @{Label="India"; Pct="99%"; Value="1,400M"}
        @{Label="Indonesia"; Pct="20%"; Value="278M"}
        @{Label="Pakistan"; Pct="16%"; Value="230M"}
        @{Label="Bangladesh"; Pct="12%"; Value="170M"}
    ) `
    -Landscape @(
        @{Value="8,849 m"; Label="Highest point"}
        @{Value="29%"; Label="Forest cover"}
        @{Value="62,800 km"; Label="Coastline"}
        @{Value="8"; Label="Climate zones"}
    ) `
    -Mountains @(
        @{Name="Mount Everest"; Height="8,849 m"}
        @{Name="K2"; Height="8,611 m"}
        @{Name="Kangchenjunga"; Height="8,586 m"}
    ) `
    -Regions @(
        @{Label="East"; Text="China, Japan, South Korea &#x2014; high density, technology and deep cultural heritage"}
        @{Label="South"; Text="Indian subcontinent, tropical climates, ancient civilisations and vast populations"}
        @{Label="Southeast"; Text="Island chains, rainforests, maritime trade and tourism corridors"}
        @{Label="Central &amp; West"; Text="Steppes, deserts, oil states, Silk Road corridors and the Caucasus"}
    ) `
    -WhyTitle "Why Asia?" `
    -Why @(
        @{Title="Highest peaks"; Text="The Himalayas, Karakoram and Hindu Kush contain all 14 eight-thousanders."}
        @{Title="Ancient civilisations"; Text="China, India, Mesopotamia, Persia and Japan &#x2014; millennia of written history."}
        @{Title="Megacities"; Text="Tokyo, Delhi, Shanghai, Mumbai and Jakarta among the world&#x2019;s largest cities."}
        @{Title="Food &amp; culture"; Text="Thousands of distinct cuisines, languages, festivals and artistic traditions."}
        @{Title="Coastlines &amp; islands"; Text="Southeast Asian archipelagos, tropical beaches and coral seas."}
    ) `
    -CountriesHtml $asiaCountries `
    -ActiveSlug $slug `
    -NavPillsHtml (Build-NavPills $slug)

Write-Utf8NoBom "$dir\index.html" $asiaPage
$written++
Write-Host "Written: asia/index.html"

# ════════════════════════════════════════════════════════════════════════════════
# 4. NORTH AMERICA
# ════════════════════════════════════════════════════════════════════════════════
$slug = "north-america"
$dir = "$base\$slug"
$heroUrl = Get-HeroUrl "$dir\index.html"

$pillsHtmlNA = ""
Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name | ForEach-Object {
    $s = $_.Name
    $fp = Join-Path $_.FullName "img\flag.svg"
    $ip = Join-Path $_.FullName "index.html"
    if ((Test-Path $fp) -and (Test-Path $ip)) {
        $raw = [System.IO.File]::ReadAllText($ip, [System.Text.Encoding]::UTF8)
        $tm = [regex]::Match($raw, '<title>([^<]+)</title>')
        $cn = if ($tm.Success) { $tm.Groups[1].Value.Trim() } else { $s }
        $pillsHtmlNA += "<a class=`"pill`" href=`"$s/index.html`"><img src=`"$s/img/flag.svg`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$cn</span></a>"
    }
}
$naCountries = "        <div class=`"pill-row`">`n          $pillsHtmlNA`n        </div>`n"

$naPage = Build-Page `
    -Title "North America" `
    -HeroUrl $heroUrl `
    -HeroText "A continent of contrasts &#x2014; Arctic wilderness in the north, Caribbean islands in the south, and vast plains, mountains and cities in between." `
    -HeroStats @(
        @{Label="Countries"; Value="23"}
        @{Label="Population"; Value="621M"}
        @{Label="Area"; Value="24.7M km2"}
        @{Label="Known for"; Value="National parks, cities, diversity"}
    ) `
    -Overview @(
        @{Label="Area"; Value="24.7 million km2"}
        @{Label="Population"; Value="621 million"}
        @{Label="Population ranking"; Value="#4"}
        @{Label="Share of world population"; Value="7.8%"}
        @{Label="Countries"; Value="23"}
        @{Label="Largest country"; Value="Canada"}
        @{Label="Smallest country"; Value="Saint Kitts and Nevis"}
        @{Label="Time zones"; Value="UTC -10 to -3"}
    ) `
    -KeyStats @(
        @{Label="Human development"; Pct="87%"; Value="High"}
        @{Label="Safety index"; Pct="52%"; Value="52"}
        @{Label="Internet access"; Pct="79%"; Value="79%"}
        @{Label="Life expectancy"; Pct="79%"; Value="75 years"}
        @{Label="GDP nominal"; Pct="100%"; Value="`$29T"}
    ) `
    -Top5Title "Top 5 Countries by Population" `
    -Top5 @(
        @{Label="USA"; Pct="100%"; Value="335M"}
        @{Label="Mexico"; Pct="39%"; Value="130M"}
        @{Label="Canada"; Pct="12%"; Value="39M"}
        @{Label="Guatemala"; Pct="5%"; Value="18M"}
        @{Label="Cuba"; Pct="3%"; Value="11M"}
    ) `
    -Landscape @(
        @{Value="6,190 m"; Label="Highest point"}
        @{Value="33%"; Label="Forest cover"}
        @{Value="202,000 km"; Label="Coastline"}
        @{Value="7"; Label="Climate zones"}
    ) `
    -Mountains @(
        @{Name="Denali"; Height="6,190 m"}
        @{Name="Mount Logan"; Height="5,959 m"}
        @{Name="Pico de Orizaba"; Height="5,636 m"}
    ) `
    -Regions @(
        @{Label="North"; Text="Canada and Alaska &#x2014; boreal forests, Arctic tundra, Great Lakes and vast wilderness"}
        @{Label="Central"; Text="United States &#x2014; diverse landscapes, major cities and the world&#x2019;s largest economy"}
        @{Label="Caribbean"; Text="Tropical islands, warm climate year-round, beaches and vibrant cultures"}
        @{Label="Mesoamerica"; Text="Rainforests, volcanoes, Maya heritage sites and Pacific and Caribbean coasts"}
    ) `
    -WhyTitle "Why North America?" `
    -Why @(
        @{Title="National parks"; Text="Yellowstone, Grand Canyon, Banff and hundreds of protected wilderness areas."}
        @{Title="Major cities"; Text="New York, Los Angeles, Chicago, Toronto and Mexico City among the world&#x2019;s leading cities."}
        @{Title="Diverse landscapes"; Text="Rockies, Great Plains, deserts, Arctic tundra and tropical islands."}
        @{Title="Tech &amp; culture"; Text="Silicon Valley, Hollywood, Broadway and global sports leagues."}
        @{Title="Road trips"; Text="Route 66, Pacific Coast Highway and cross-country drives through iconic scenery."}
    ) `
    -CountriesHtml $naCountries `
    -ActiveSlug $slug `
    -NavPillsHtml (Build-NavPills $slug)

Write-Utf8NoBom "$dir\index.html" $naPage
$written++
Write-Host "Written: north-america/index.html"

# ════════════════════════════════════════════════════════════════════════════════
# 5. OCEANIA
# ════════════════════════════════════════════════════════════════════════════════
$slug = "oceania"
$dir = "$base\$slug"
$heroUrl = Get-HeroUrl "$dir\index.html"

$pillsHtmlOceania = ""
Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name | ForEach-Object {
    $s = $_.Name
    $fp = Join-Path $_.FullName "img\flag.svg"
    $ip = Join-Path $_.FullName "index.html"
    if ((Test-Path $fp) -and (Test-Path $ip)) {
        $raw = [System.IO.File]::ReadAllText($ip, [System.Text.Encoding]::UTF8)
        $tm = [regex]::Match($raw, '<title>([^<]+)</title>')
        $cn = if ($tm.Success) { $tm.Groups[1].Value.Trim() } else { $s }
        $pillsHtmlOceania += "<a class=`"pill`" href=`"$s/index.html`"><img src=`"$s/img/flag.svg`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$cn</span></a>"
    }
}
$oceaniaCountries = "        <div class=`"pill-row`">`n          $pillsHtmlOceania`n        </div>`n"

$oceaniaPage = Build-Page `
    -Title "Oceania" `
    -HeroUrl $heroUrl `
    -HeroText "Pacific island nations, coral seas, southern skies and the world&#x2019;s largest landmass island &#x2014; a region defined by ocean, nature and indigenous cultures." `
    -HeroStats @(
        @{Label="Countries"; Value="14"}
        @{Label="Population"; Value="45M"}
        @{Label="Area"; Value="8.5M km2"}
        @{Label="Known for"; Value="Reefs, islands, wildlife"}
    ) `
    -Overview @(
        @{Label="Area"; Value="8.5 million km2"}
        @{Label="Population"; Value="45 million"}
        @{Label="Population ranking"; Value="#6"}
        @{Label="Share of world population"; Value="0.5%"}
        @{Label="Countries"; Value="14"}
        @{Label="Largest country"; Value="Australia"}
        @{Label="Smallest country"; Value="Nauru"}
        @{Label="Time zones"; Value="UTC +8 to +13"}
    ) `
    -KeyStats @(
        @{Label="Human development"; Pct="93%"; Value="Very high"}
        @{Label="Safety index"; Pct="65%"; Value="65"}
        @{Label="Internet access"; Pct="88%"; Value="88%"}
        @{Label="Life expectancy"; Pct="83%"; Value="79 years"}
        @{Label="GDP nominal"; Pct="15%"; Value="`$2.1T"}
    ) `
    -Top5Title "Top 5 Countries by Population" `
    -Top5 @(
        @{Label="Australia"; Pct="100%"; Value="26M"}
        @{Label="Papua New Guinea"; Pct="38%"; Value="10M"}
        @{Label="New Zealand"; Pct="19%"; Value="5M"}
        @{Label="Fiji"; Pct="4%"; Value="930k"}
        @{Label="Solomon Islands"; Pct="3%"; Value="720k"}
    ) `
    -Landscape @(
        @{Value="4,884 m"; Label="Highest point"}
        @{Value="25%"; Label="Forest cover"}
        @{Value="135,000 km"; Label="Coastline"}
        @{Value="5"; Label="Climate zones"}
    ) `
    -Mountains @(
        @{Name="Puncak Jaya"; Height="4,884 m"}
        @{Name="Mount Wilhelm"; Height="4,509 m"}
        @{Name="Aoraki / Mount Cook"; Height="3,724 m"}
    ) `
    -Regions @(
        @{Label="Australia"; Text="World&#x2019;s largest island-continent &#x2014; outback, reefs, desert and temperate south"}
        @{Label="Melanesia"; Text="Papua New Guinea, Fiji, Solomon Islands &#x2014; rich cultures and biodiversity"}
        @{Label="Polynesia"; Text="Samoa, Tonga, Cook Islands &#x2014; remote Pacific islands and ocean traditions"}
        @{Label="Micronesia"; Text="Tiny atolls, Marshall Islands, diving and Pacific histories"}
    ) `
    -WhyTitle "Why Oceania?" `
    -Why @(
        @{Title="Great Barrier Reef"; Text="World&#x2019;s largest coral reef system with over 2,900 individual reefs."}
        @{Title="Unique wildlife"; Text="Kangaroos, koalas, kiwi birds and endemic island species found nowhere else."}
        @{Title="Indigenous cultures"; Text="Aboriginal Australians, Maori and Pacific Islander traditions spanning thousands of years."}
        @{Title="Remote nature"; Text="Untouched beaches, ancient rainforests and isolated volcanic islands."}
        @{Title="Adventure"; Text="Surfing, diving, hiking and iconic routes from the Great Ocean Road to Milford Sound."}
    ) `
    -CountriesHtml $oceaniaCountries `
    -ActiveSlug $slug `
    -NavPillsHtml (Build-NavPills $slug)

Write-Utf8NoBom "$dir\index.html" $oceaniaPage
$written++
Write-Host "Written: oceania/index.html"

# ════════════════════════════════════════════════════════════════════════════════
# 6. SOUTH AMERICA
# ════════════════════════════════════════════════════════════════════════════════
$slug = "south-america"
$dir = "$base\$slug"
$heroUrl = Get-HeroUrl "$dir\index.html"

$pillsHtmlSA = ""
Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name | ForEach-Object {
    $s = $_.Name
    $fp = Join-Path $_.FullName "img\flag.svg"
    $ip = Join-Path $_.FullName "index.html"
    if ((Test-Path $fp) -and (Test-Path $ip)) {
        $raw = [System.IO.File]::ReadAllText($ip, [System.Text.Encoding]::UTF8)
        $tm = [regex]::Match($raw, '<title>([^<]+)</title>')
        $cn = if ($tm.Success) { $tm.Groups[1].Value.Trim() } else { $s }
        $pillsHtmlSA += "<a class=`"pill`" href=`"$s/index.html`"><img src=`"$s/img/flag.svg`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$cn</span></a>"
    }
}
$saCountries = "        <div class=`"pill-row`">`n          $pillsHtmlSA`n        </div>`n"

$saPage = Build-Page `
    -Title "South America" `
    -HeroUrl $heroUrl `
    -HeroText "The Amazon basin, Andean peaks, Patagonian ice fields and Atlantic cities &#x2014; South America holds some of Earth&#x2019;s most dramatic and biodiverse landscapes." `
    -HeroStats @(
        @{Label="Countries"; Value="12"}
        @{Label="Population"; Value="432M"}
        @{Label="Area"; Value="17.8M km2"}
        @{Label="Known for"; Value="Amazon, Andes, wildlife"}
    ) `
    -Overview @(
        @{Label="Area"; Value="17.8 million km2"}
        @{Label="Population"; Value="432 million"}
        @{Label="Population ranking"; Value="#5"}
        @{Label="Share of world population"; Value="5.4%"}
        @{Label="Countries"; Value="12"}
        @{Label="Largest country"; Value="Brazil"}
        @{Label="Smallest country"; Value="Suriname"}
        @{Label="Time zones"; Value="UTC -5 to -2"}
    ) `
    -KeyStats @(
        @{Label="Human development"; Pct="76%"; Value="Medium&#x2013;high"}
        @{Label="Safety index"; Pct="38%"; Value="38"}
        @{Label="Internet access"; Pct="76%"; Value="76%"}
        @{Label="Life expectancy"; Pct="79%"; Value="75 years"}
        @{Label="GDP nominal"; Pct="30%"; Value="`$4.5T"}
    ) `
    -Top5Title "Top 5 Countries by Population" `
    -Top5 @(
        @{Label="Brazil"; Pct="100%"; Value="215M"}
        @{Label="Colombia"; Pct="24%"; Value="52M"}
        @{Label="Argentina"; Pct="21%"; Value="46M"}
        @{Label="Peru"; Pct="15%"; Value="33M"}
        @{Label="Venezuela"; Pct="15%"; Value="33M"}
    ) `
    -Landscape @(
        @{Value="6,961 m"; Label="Highest point"}
        @{Value="57%"; Label="Forest cover"}
        @{Value="32,000 km"; Label="Coastline"}
        @{Value="6"; Label="Climate zones"}
    ) `
    -Mountains @(
        @{Name="Aconcagua"; Height="6,961 m"}
        @{Name="Ojos del Salado"; Height="6,893 m"}
        @{Name="Monte Pissis"; Height="6,795 m"}
    ) `
    -Regions @(
        @{Label="North"; Text="Amazon basin and Venezuela &#x2014; equatorial rainforest, rivers and biodiversity"}
        @{Label="Andes"; Text="Mountain spine from Colombia to Patagonia &#x2014; altiplano, volcanoes and glaciers"}
        @{Label="Atlantic Coast"; Text="Brazil&#x2019;s coast, Buenos Aires corridor and the Pampas grasslands"}
        @{Label="Southern Cone"; Text="Argentina, Chile, Patagonia, Tierra del Fuego and Antarctic gateways"}
    ) `
    -WhyTitle "Why South America?" `
    -Why @(
        @{Title="Amazon rainforest"; Text="World&#x2019;s largest tropical rainforest &#x2014; over half of Earth&#x2019;s remaining rainforest."}
        @{Title="Andean peaks"; Text="Longest mountain range on Earth with Aconcagua reaching 6,961 m."}
        @{Title="Wildlife"; Text="Gal&#x00E1;pagos, jaguars, giant anteaters, spectacled bears and pink river dolphins."}
        @{Title="Culture &amp; carnival"; Text="Carnival, tango, cumbia, ceviche and deeply layered indigenous and colonial heritage."}
        @{Title="Iguazu &amp; Patagonia"; Text="Iguazu Falls, Torres del Paine, Atacama Desert and the Pantanal wetlands."}
    ) `
    -CountriesHtml $saCountries `
    -ActiveSlug $slug `
    -NavPillsHtml (Build-NavPills $slug)

Write-Utf8NoBom "$dir\index.html" $saPage
$written++
Write-Host "Written: south-america/index.html"

Write-Host ""
Write-Host "Done. $written files written."

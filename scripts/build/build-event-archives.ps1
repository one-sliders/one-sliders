$ErrorActionPreference = 'Stop'

$months = @{
  '01'='January'; '02'='February'; '03'='March'; '04'='April'; '05'='May'; '06'='June'
  '07'='July'; '08'='August'; '09'='September'; '10'='October'; '11'='November'; '12'='December'
}

function CleanText([string]$html) {
  [Net.WebUtility]::HtmlDecode(($html -replace '<.*?>', '').Trim())
}

$baseCss = @'
:root{--theme:#1f6f83;--accent:#f0b94a;--ink:#14202a;--paper:#f7f8f4;--muted:#5e6b70;--line:rgba(20,32,42,.14)}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--paper)}a{color:inherit}.top-menu{position:sticky;top:0;z-index:3;display:flex;gap:8px;overflow-x:auto;padding:8px clamp(14px,3vw,36px);background:rgba(251,250,246,.95);border-bottom:1px solid var(--line)}.top-menu a{flex:0 0 auto;padding:7px 12px;border-radius:999px;text-decoration:none;font-size:13px}.top-menu a:hover,.top-menu a.active{background:var(--theme);color:white}.wrap{padding:clamp(20px,5vw,64px);display:grid;gap:18px}.hero{max-width:820px}.hero p{color:var(--muted);font-size:17px;line-height:1.45}.hero h1{margin:0 0 10px;font-size:clamp(38px,6vw,72px);line-height:.95}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.card{display:block;padding:14px 16px;border:1px solid var(--line);border-left:4px solid var(--theme);border-radius:8px;background:white;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.05)}.card span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:800;margin-bottom:5px}.card strong{display:block;font-size:18px}.site-footer{padding:14px clamp(14px,3vw,36px);color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:rgba(251,250,246,.92)}.site-footer p{margin:0}.site-footer a{color:inherit}
'@

foreach ($month in $months.Keys) {
  $dir = Join-Path 'content/events/2026' $month
  $cards = @()
  foreach ($file in Get-ChildItem $dir -Filter *.html | Where-Object { $_.Name -notin @('index.html','octoberfest.html','oktoberfest-2026.html','octoberfest-2026.html') }) {
    if ($file.BaseName -in @('octoberfest','oktoberfest-2026','octoberfest-2026')) { continue }
    $html = [IO.File]::ReadAllText($file.FullName)
    if ($html -notmatch '<h1>') { continue }
    $title = CleanText ([regex]::Match($html, '<h1>(.*?)</h1>').Groups[1].Value)
    $date = CleanText ([regex]::Match($html, '<div class="fact"><span>Exact dates</span><strong>(.*?)</strong></div>').Groups[1].Value)
    if (-not $date) { $date = '2026 event' }
    $cards += '<a class="card" href="' + $file.Name + '"><span>' + [Net.WebUtility]::HtmlEncode($date) + '</span><strong>' + [Net.WebUtility]::HtmlEncode($title) + '</strong></a>'
  }
  $monthName = $months[$month]
  $page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + $monthName + ' 2026 events</title><style>' + $baseCss + '</style></head><body><nav class="top-menu"><a href="../../index.html">Events</a><a href="../index.html">2026</a><a class="active" aria-current="page" href="index.html">' + $monthName + '</a></nav><main class="wrap"><section class="hero"><h1>' + $monthName + ' 2026</h1><p>Events and one-sliders scheduled for ' + $monthName + ' 2026.</p></section><section class="grid">' + ($cards -join '') + '</section></main><footer class="site-footer"><p>&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. All rights reserved.</p></footer></body></html>'
  [IO.File]::WriteAllText((Join-Path $dir 'index.html'), $page, [Text.UTF8Encoding]::new($false))
}

$monthCards = foreach ($month in ($months.Keys | Sort-Object)) {
  $count = (Get-ChildItem (Join-Path 'content/events/2026' $month) -Filter *.html | Where-Object { $_.Name -ne 'index.html' }).Count
  '<a class="card" href="' + $month + '/index.html"><span>' + $count + ' pages</span><strong>' + $months[$month] + '</strong></a>'
}

$yearPage = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Events 2026</title><style>' + $baseCss + '</style></head><body><nav class="top-menu"><a href="../index.html">Events</a><a class="active" aria-current="page" href="index.html">2026</a></nav><main class="wrap"><section class="hero"><h1>Events 2026</h1><p>Monthly archive for event one-sliders in 2026.</p></section><section class="grid">' + ($monthCards -join '') + '</section></main><footer class="site-footer"><p>&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. All rights reserved.</p></footer></body></html>'
[IO.File]::WriteAllText('content/events/2026/index.html', $yearPage, [Text.UTF8Encoding]::new($false))

'event_archives_built'

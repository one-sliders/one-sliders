$ErrorActionPreference = 'Stop'

$months = @{
  '01'='January'; '02'='February'; '03'='March'; '04'='April'; '05'='May'; '06'='June'
  '07'='July'; '08'='August'; '09'='September'; '10'='October'; '11'='November'; '12'='December'
}

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html | Where-Object { $_.Name -ne 'index.html' }) {
  $month = $file.Directory.Name
  if (-not $months.ContainsKey($month)) { continue }
  $monthName = $months[$month]
  $html = [IO.File]::ReadAllText($file.FullName)
  $title = [Net.WebUtility]::HtmlDecode(([regex]::Match($html, '<h1>(.*?)</h1>').Groups[1].Value -replace '<.*?>','').Trim())
  if (-not $title) { $title = $file.BaseName }
  $titleEsc = [Net.WebUtility]::HtmlEncode($title)

  $breadcrumb = '<a href="../../index.html">Events 2026</a><a href="index.html">' + $monthName + '</a><a class="active" aria-current="page" href="' + $file.Name + '">' + $titleEsc + '</a>'

  $next = [regex]::Replace(
    $html,
    '(<span class="nav-divider"></span>)([\s\S]*?)(</nav><main class="slide">)',
    '$1' + $breadcrumb + '$3',
    1
  )

  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"event_breadcrumbs_updated=$updated"

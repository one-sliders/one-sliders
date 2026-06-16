$root = Resolve-Path "content/events/2026"
$eventPages = Get-ChildItem $root -Recurse -Filter "*.html" | Where-Object { $_.Name -ne "index.html" }

function Decode-HtmlText {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
  $withoutTags = [regex]::Replace($Value, "<[^>]+>", "")
  return [System.Net.WebUtility]::HtmlDecode($withoutTags).Trim()
}

function Get-SectionLinks {
  param(
    [string]$Html,
    [string]$Label
  )

  $pattern = '<p class="section-label">' + [regex]::Escape($Label) + '</p>\s*<div class="link-grid">(?<links>.*?)</div>'
  $match = [regex]::Match($Html, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $match.Success) { return @() }

  $linkMatches = [regex]::Matches($match.Groups["links"].Value, '<a\b[^>]*>(?<text>.*?)</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $values = New-Object System.Collections.Generic.List[string]
  foreach ($link in $linkMatches) {
    $text = Decode-HtmlText $link.Groups["text"].Value
    if ($text) { [void]$values.Add($text) }
  }
  return $values.ToArray()
}

function Escape-IcsText {
  param([string]$Value)
  if ($null -eq $Value) { return "" }
  return $Value.Replace("\", "\\").Replace(";", "\;").Replace(",", "\,").Replace("`r", "").Replace("`n", "\n")
}

function Build-Location {
  param(
    [string[]]$Cities,
    [string[]]$Countries
  )

  $cityText = ($Cities | Where-Object { $_ } | Select-Object -Unique) -join " / "
  $countryText = ($Countries | Where-Object { $_ } | Select-Object -Unique) -join " / "

  if ($cityText -and $countryText) { return "$cityText, $countryText" }
  if ($cityText) { return $cityText }
  return $countryText
}

$updated = 0
foreach ($page in $eventPages) {
  $slug = [IO.Path]::GetFileNameWithoutExtension($page.Name)
  $month = $page.Directory.Name
  $icsPath = Join-Path $page.Directory.FullName "$slug.ics"
  if (-not (Test-Path $icsPath)) { continue }

  $html = [IO.File]::ReadAllText($page.FullName)
  $cities = Get-SectionLinks -Html $html -Label "Cities"
  $countries = Get-SectionLinks -Html $html -Label "Countries"
  $location = Build-Location -Cities $cities -Countries $countries
  $url = "https://one-sliders.com/events/2026/$month/$slug.html"

  $ics = [IO.File]::ReadAllText($icsPath)
  $lines = $ics -split "`r?`n" | Where-Object {
    $_ -and
    ($_ -notmatch '^LOCATION[:;]') -and
    ($_ -notmatch '^URL[:;]')
  }

  $newLines = New-Object System.Collections.Generic.List[string]
  $inserted = $false
  foreach ($line in $lines) {
    [void]$newLines.Add($line)
    if (-not $inserted -and $line -match '^DESCRIPTION[:;]') {
      if ($location) { [void]$newLines.Add("LOCATION:" + (Escape-IcsText $location)) }
      [void]$newLines.Add("URL:$url")
      $inserted = $true
    }
  }

  if (-not $inserted) {
    $endIndex = $newLines.IndexOf("END:VEVENT")
    if ($endIndex -ge 0) {
      if ($location) { $newLines.Insert($endIndex, "LOCATION:" + (Escape-IcsText $location)) }
      $newLines.Insert($endIndex + 1, "URL:$url")
    }
  }

  [IO.File]::WriteAllText($icsPath, (($newLines -join "`r`n") + "`r`n"), [Text.UTF8Encoding]::new($false))
  $updated++
}

"Updated $updated calendar files."

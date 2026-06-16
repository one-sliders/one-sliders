$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$locationRoot = Join-Path $repoRoot 'content\locations'
$encoding = New-Object System.Text.UTF8Encoding $false

$sourceScripts = @(
  'rebuild-africa-countries.ps1',
  'rebuild-asia-countries.ps1',
  'rebuild-europe-countries.ps1',
  'rebuild-northamerica-countries.ps1',
  'rebuild-oceania-countries.ps1',
  'rebuild-southamerica-countries.ps1'
)

$isoBySlug = @{}

foreach ($scriptName in $sourceScripts) {
  $scriptPath = Join-Path $repoRoot $scriptName
  if (-not (Test-Path $scriptPath)) { continue }

  $currentSlug = $null
  foreach ($line in [System.IO.File]::ReadLines($scriptPath)) {
    if ($line -match "^\s*'([^']+)'\s*=\s*@\{") {
      $currentSlug = $Matches[1]
    }

    if ($currentSlug -and $line -match "iso='([^']+)'") {
      $isoBySlug[$currentSlug] = $Matches[1].ToLowerInvariant()
      $currentSlug = $null
    }
  }
}

$manualIso = @{
  'algeria' = 'dz'
  'angola' = 'ao'
  'benin' = 'bj'
  'botswana' = 'bw'
  'burkina-faso' = 'bf'
  'burundi' = 'bi'
  'cabo-verde' = 'cv'
  'cameroon' = 'cm'
  'central-african-republic' = 'cf'
  'chad' = 'td'
  'comoros' = 'km'
  'democratic-republic-of-the-congo' = 'cd'
  'djibouti' = 'dj'
  'egypt' = 'eg'
  'equatorial-guinea' = 'gq'
  'eritrea' = 'er'
  'eswatini' = 'sz'
  'ethiopia' = 'et'
  'gabon' = 'ga'
  'gambia' = 'gm'
  'ghana' = 'gh'
  'guinea' = 'gn'
  'guinea-bissau' = 'gw'
  'ivory-coast' = 'ci'
  'kenya' = 'ke'
  'lesotho' = 'ls'
  'liberia' = 'lr'
  'libya' = 'ly'
  'madagascar' = 'mg'
  'malawi' = 'mw'
  'mali' = 'ml'
  'mauritania' = 'mr'
  'mauritius' = 'mu'
  'morocco' = 'ma'
  'mozambique' = 'mz'
  'namibia' = 'na'
  'niger' = 'ne'
  'nigeria' = 'ng'
  'norway' = 'no'
  'republic-of-the-congo' = 'cg'
  'rwanda' = 'rw'
  'sao-tome-and-principe' = 'st'
  'senegal' = 'sn'
  'seychelles' = 'sc'
  'sierra-leone' = 'sl'
  'somalia' = 'so'
  'south-africa' = 'za'
  'south-sudan' = 'ss'
  'sudan' = 'sd'
  'tanzania' = 'tz'
  'togo' = 'tg'
  'tunisia' = 'tn'
  'uganda' = 'ug'
  'zambia' = 'zm'
  'zimbabwe' = 'zw'
}

foreach ($slug in $manualIso.Keys) {
  $isoBySlug[$slug] = $manualIso[$slug]
}

$flagFiles = @(Get-ChildItem -Path $locationRoot -Recurse -Filter 'flag.svg' -File | Sort-Object FullName)
$missingIso = @()
$downloads = @()

foreach ($flagFile in $flagFiles) {
  $relativePath = $flagFile.FullName.Substring($locationRoot.Length).TrimStart('\', '/')
  $parts = $relativePath -split '[\\/]'
  if ($parts.Length -lt 3) { continue }

  $continent = $parts[0]
  $slug = $parts[1]
  if (-not $isoBySlug.ContainsKey($slug)) {
    $missingIso += "$continent/$slug"
    continue
  }

  $iso = $isoBySlug[$slug]
  $url = "https://flagcdn.com/$iso.svg"
  $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 30
  $svg = [string]$response.Content

  if ($response.StatusCode -ne 200 -or $svg -notmatch '<svg[\s>]') {
    throw "Invalid flag response for $continent/$slug ($url)"
  }

  $downloads += [pscustomobject]@{
    Path = $flagFile.FullName
    Slug = $slug
    Iso = $iso
    Svg = $svg.Trim()
  }
}

if ($missingIso.Count -gt 0) {
  throw "Missing ISO codes: $($missingIso -join ', ')"
}

foreach ($download in $downloads) {
  [System.IO.File]::WriteAllText($download.Path, $download.Svg + "`n", $encoding)
}

Write-Host "Refreshed $($downloads.Count) location flag SVGs from flagcdn.com."

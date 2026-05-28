# build-sitemap.ps1
# Generates sitemap.xml for canonical, indexable OneSliders pages only.

$base = (Resolve-Path ".").Path
$domain = "https://one-sliders.com"
$excludedDirs = "\\(\.git|tmp|ar|de|es|fr|ha|hi|mi|no|pt|qu|ru|sw|tpi|zh)\\"

function Convert-ToUrlPath($file) {
  $rel = $file.FullName.Substring($base.Length + 1).Replace('\', '/')
  if ($rel -eq "index.html") { return "" }
  return $rel
}

function Get-Canonical($html) {
  $m = [regex]::Match($html, '<link[^>]*rel=["'']canonical["''][^>]*>', 'IgnoreCase')
  if (-not $m.Success) { return $null }
  $h = [regex]::Match($m.Value, 'href=["'']([^"'']+)["'']', 'IgnoreCase')
  if (-not $h.Success) { return $null }
  return $h.Groups[1].Value.TrimEnd('/')
}

function Is-NoIndex($html) {
  return [regex]::IsMatch($html, '<meta[^>]*name=["'']robots["''][^>]*content=["''][^"'']*noindex', 'IgnoreCase')
}

function Get-Priority($urlPath) {
  if ($urlPath -eq "") { return "1.0" }
  if ($urlPath -match '^(?:en/)?content/events/index\.html$') { return "0.9" }
  if ($urlPath -match '^(?:en/)?content/categories/index\.html$') { return "0.9" }
  if ($urlPath -match '^content/locations/index\.html$') { return "0.9" }
  if ($urlPath -match '^en/content/categories/[^/]+/[^/]+/events/[^/]+\.html$') { return "0.85" }
  if ($urlPath -match '^(?:en/)?content/categories/[^/]+/index\.html$') { return "0.8" }
  if ($urlPath -match '^(?:en/)?content/categories/[^/]+/[^/]+\.html$') { return "0.7" }
  if ($urlPath -match '^content/locations/[^/]+/index\.html$') { return "0.7" }
  if ($urlPath -match '^content/locations/[^/]+/[^/]+/index\.html$') { return "0.6" }
  if ($urlPath -match '^content/locations/') { return "0.5" }
  return "0.5"
}

function Get-Changefreq($urlPath) {
  if ($urlPath -eq "") { return "weekly" }
  if ($urlPath -match '^(?:en/)?content/events/index\.html$') { return "daily" }
  if ($urlPath -match '^en/content/categories/[^/]+/[^/]+/events/') { return "weekly" }
  if ($urlPath -match '^content/locations/') { return "monthly" }
  if ($urlPath -match '^(?:en/)?content/categories/') { return "weekly" }
  return "monthly"
}

$files = Get-ChildItem -Path $base -Recurse -Filter "*.html" |
  Where-Object {
    $_.FullName -notmatch $excludedDirs -and
    $_.FullName -notmatch '\\docs\\' -and
    $_.FullName -notmatch '\\shopping-list\\'
  }

$urls = @()
foreach ($file in ($files | Sort-Object FullName)) {
  $urlPath = Convert-ToUrlPath $file
  $loc = if ($urlPath -eq "") { "$domain/" } else { "$domain/$urlPath" }
  $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  if (Is-NoIndex $html) { continue }
  $canonical = Get-Canonical $html
  if ($canonical -and ($canonical -ne $loc.TrimEnd('/'))) { continue }

  $urls += [pscustomobject]@{
    Loc = $loc
    LastMod = $file.LastWriteTime.ToString("yyyy-MM-dd")
    Changefreq = Get-Changefreq $urlPath
    Priority = Get-Priority $urlPath
  }
}

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($url in $urls) {
  [void]$sb.AppendLine("  <url>")
  [void]$sb.AppendLine("    <loc>$($url.Loc)</loc>")
  [void]$sb.AppendLine("    <lastmod>$($url.LastMod)</lastmod>")
  [void]$sb.AppendLine("    <changefreq>$($url.Changefreq)</changefreq>")
  [void]$sb.AppendLine("    <priority>$($url.Priority)</priority>")
  [void]$sb.AppendLine("  </url>")
}

[void]$sb.AppendLine('</urlset>')

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $base "sitemap.xml"), $sb.ToString(), $utf8NoBom)
Write-Host "sitemap.xml written: $($urls.Count) canonical URLs"

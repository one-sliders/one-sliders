# build-sitemap.ps1
# Generates sitemap.xml covering all English HTML pages on one-sliders.com.
# Includes both the default-English content/ tree and the new English
# language-prefixed en/ tree (new layout event pages live there).
# Non-English language versions (ar/, de/, fr/, ...) are excluded.

$base   = "C:\Users\AndersEriksson\3DF\OneSlider"
$domain = "https://one-sliders.com"

# Collect English HTML files: content/ (no prefix) and en/ subtree.
# Exclude all other language prefixes when traversing content/.
$contentFiles = Get-ChildItem -Path "$base\content" -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\(ar|de|en|es|fr|ha|hi|mi|no|pt|qu|ru|sw|tpi|zh)\\' }

$enFiles = @()
if (Test-Path "$base\en") {
  $enFiles = Get-ChildItem -Path "$base\en" -Recurse -Filter "*.html"
}

$files = $contentFiles + $enFiles

# Priority rules (path uses forward slashes after normalisation)
function Get-Priority($relPath) {
  if ($relPath -match '^(?:en/)?content/events/index\.html$')                                  { return '1.0' }
  if ($relPath -match '^(?:en/)?content/locations/index\.html$')                               { return '0.9' }
  if ($relPath -match '^(?:en/)?content/categories/index\.html$')                              { return '0.9' }
  # NEW: events under categories/<cat>/<topic>/events/<slug>.html
  if ($relPath -match '^(?:en/)?content/categories/[^/]+/[^/]+/events/[^/]+\.html$')           { return '0.85' }
  # Legacy events under content/events/YYYY/MM/<slug>.html
  if ($relPath -match '^(?:en/)?content/events/\d{4}/\d{2}/[^/]+\.html$')                      { return '0.7' }
  # Category index pages and topic pages
  if ($relPath -match '^(?:en/)?content/categories/[^/]+/index\.html$')                        { return '0.8' }
  if ($relPath -match '^(?:en/)?content/categories/[^/]+/[^/]+\.html$')                        { return '0.7' }
  # Locations hierarchy
  if ($relPath -match '^(?:en/)?content/locations/[^/]+/index\.html$')                         { return '0.7' }  # continent
  if ($relPath -match '^(?:en/)?content/locations/[^/]+/[^/]+/index\.html$')                   { return '0.6' }  # country
  if ($relPath -match '^(?:en/)?content/locations/')                                           { return '0.5' }  # city
  if ($relPath -match '^(?:en/)?content/categories/')                                          { return '0.6' }
  return '0.5'
}

function Get-Changefreq($relPath) {
  if ($relPath -match '^(?:en/)?content/events/index\.html$')                       { return 'daily' }
  if ($relPath -match '^(?:en/)?content/categories/[^/]+/[^/]+/events/')            { return 'weekly' }
  if ($relPath -match '^(?:en/)?content/events/\d{4}/\d{2}/')                       { return 'weekly' }
  if ($relPath -match '^(?:en/)?content/locations/')                                { return 'monthly' }
  if ($relPath -match '^(?:en/)?content/categories/')                               { return 'weekly' }
  return 'monthly'
}

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

$count = 0
foreach ($f in ($files | Sort-Object FullName)) {
  # Build URL path: strip base path, convert backslashes, prefix domain
  $rel = $f.FullName.Substring($base.Length + 1).Replace('\', '/')
  $url = "$domain/$rel"

  $prio  = Get-Priority $rel
  $freq  = Get-Changefreq $rel
  # Use file's last-write date as lastmod
  $lastmod = $f.LastWriteTime.ToString("yyyy-MM-dd")

  [void]$sb.AppendLine("  <url>")
  [void]$sb.AppendLine("    <loc>$url</loc>")
  [void]$sb.AppendLine("    <lastmod>$lastmod</lastmod>")
  [void]$sb.AppendLine("    <changefreq>$freq</changefreq>")
  [void]$sb.AppendLine("    <priority>$prio</priority>")
  [void]$sb.AppendLine("  </url>")
  $count++
}

[void]$sb.AppendLine('</urlset>')

$out = "$base\sitemap.xml"
# Write without BOM (UTF-8 without BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($out, $sb.ToString(), $utf8NoBom)
Write-Host "sitemap.xml written: $count URLs"

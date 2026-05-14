# build-sitemap.ps1
# Generates sitemap.xml covering all HTML pages under content/

$base   = "C:\Users\AndersEriksson\3DF\OneSlider"
$domain = "https://one-sliders.com"
$today  = Get-Date -Format "yyyy-MM-dd"

# Collect all HTML files under content/
$files = Get-ChildItem -Path "$base\content" -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\(ar|de|en|es|fr|ha|hi|mi|no|pt|qu|ru|sw|tpi|zh)\\' }

# Priority rules
function Get-Priority($relPath) {
  if ($relPath -match 'events[/\\]index\.html$')     { return '1.0' }
  if ($relPath -match 'locations[/\\]index\.html$')  { return '0.9' }
  if ($relPath -match 'categories[/\\]index\.html$') { return '0.9' }
  if ($relPath -match 'events[/\\]\d{4}[/\\]\d{2}[/\\][^/\\]+\.html$') { return '0.8' }  # event detail
  if ($relPath -match 'locations[/\\][^/\\]+[/\\]index\.html$')         { return '0.7' }  # continent
  if ($relPath -match 'locations[/\\][^/\\]+[/\\][^/\\]+[/\\]index\.html$') { return '0.6' }  # country
  if ($relPath -match 'locations[/\\]')              { return '0.5' }  # city
  if ($relPath -match 'categories[/\\]')             { return '0.6' }
  return '0.5'
}

function Get-Changefreq($relPath) {
  if ($relPath -match 'events[/\\]index\.html$') { return 'daily' }
  if ($relPath -match 'events[/\\]\d{4}[/\\]\d{2}[/\\]') { return 'weekly' }
  if ($relPath -match 'locations[/\\]')           { return 'monthly' }
  if ($relPath -match 'categories[/\\]')          { return 'weekly' }
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
[System.IO.File]::WriteAllText($out, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "sitemap.xml written: $count URLs"

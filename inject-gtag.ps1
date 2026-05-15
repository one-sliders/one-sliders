# inject-gtag.ps1
# Injects Google tag (gtag.js) immediately after <head> on every HTML page.
# Skips files that already contain G-1EG5HKVW09.

$base = "C:\Users\AndersEriksson\3DF\OneSlider"

$snippet = @'

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1EG5HKVW09"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-1EG5HKVW09');
  </script>
'@

$files = Get-ChildItem -Path $base -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|tmp)\\' }

$updated = 0
$skipped = 0
$noHead  = 0

foreach ($f in $files) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)

  if ($html -match 'G-1EG5HKVW09') {
    $skipped++
    continue
  }

  # Match <head> opening tag (with or without attributes), case-insensitive
  $newHtml = [regex]::Replace(
    $html,
    '(?i)(<head\b[^>]*>)',
    { param($m) $m.Groups[1].Value + $snippet },
    1
  )

  if ($newHtml -eq $html) {
    $noHead++
    continue
  }

  [System.IO.File]::WriteAllText($f.FullName, $newHtml, [System.Text.Encoding]::UTF8)
  $updated++
}

Write-Host "Updated:  $updated"
Write-Host "Skipped:  $skipped (already had tag)"
Write-Host "No head:  $noHead"

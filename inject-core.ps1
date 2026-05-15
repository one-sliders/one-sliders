# inject-core.ps1
# Replaces the existing GA4 gtag snippet with the new Consent Mode v2
# default + a single defer-loaded oneslider-core.js + core stylesheet.
#
# Idempotent: skips files that already reference oneslider-core.js.
# Safe to re-run after future template changes.

$base = "C:\Users\AndersEriksson\3DF\OneSlider"

# This is the EXACT block that inject-gtag.ps1 wrote on every page.
# Matching it as a literal keeps this script fast and deterministic.
$oldBlock = @"

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1EG5HKVW09"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-1EG5HKVW09');
  </script>
"@

# New minimal block: Consent Mode default (denied) MUST execute synchronously
# before gtag.js loads, so it stays inline. Everything else (banner UI, geo
# detection, future site-wide features) lives in oneslider-core.js.
$newBlock = @"

  <!-- Google Consent Mode v2 + GA4 -->
  <script>
  window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
  gtag('js',new Date());gtag('config','G-1EG5HKVW09');
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1EG5HKVW09"></script>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
"@

$files = Get-ChildItem -Path $base -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|tmp)\\' }

$replaced = 0
$alreadyOk = 0
$noMatch = 0

foreach ($f in $files) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)

  if ($html -match 'oneslider-core\.js') {
    $alreadyOk++
    continue
  }

  if ($html.Contains($oldBlock)) {
    $newHtml = $html.Replace($oldBlock, $newBlock)
    [System.IO.File]::WriteAllText($f.FullName, $newHtml, [System.Text.Encoding]::UTF8)
    $replaced++
  }
  else {
    # File has the GA tag but in a different shape (e.g. privacy/terms.html
    # which we wrote by hand). Leave it alone.
    $noMatch++
  }
}

Write-Host "Replaced:       $replaced"
Write-Host "Already correct: $alreadyOk"
Write-Host "No match:       $noMatch"

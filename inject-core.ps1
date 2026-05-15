# inject-core.ps1
# Installs / updates the OneSliders consent + tracking snippet on every
# HTML page. Idempotent: running it again either inserts the snippet,
# upgrades an older version, or does nothing.

$base = "C:\Users\AndersEriksson\3DF\OneSlider"

# Snippet versions we recognise, oldest first. Anything matching ANY of
# these is replaced by $newBlock below.
#
# v1: original gtag-only snippet (inject-gtag.ps1)
# v2: first consent-mode snippet (no localStorage pre-apply)
$oldBlocks = @()

$oldBlocks += @"

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1EG5HKVW09"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-1EG5HKVW09');
  </script>
"@

$oldBlocks += @"

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

# Current snippet (v3): same as v2, but the inline script also reads any
# saved consent choice from localStorage and applies it BEFORE gtag.js
# loads. This means returning visitors get gtag.js bootstrapped with
# their actual consent state from millisecond zero — no flicker, no
# default-denied beacon firing before the choice is re-read.
#
# Marker comment "OneSlider core v3" is what future versions will look
# for to detect that this exact version is already installed.
$newBlock = @"

  <!-- OneSlider core v3: Consent Mode v2 + GA4 + persisted choice -->
  <script>
  window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
  try{var _c=localStorage.getItem('os_consent_v1');if(_c){_c=JSON.parse(_c);if(_c&&(!_c.ts||(Date.now()-_c.ts)<31536000000)){gtag('consent','update',{ad_storage:_c.ads?'granted':'denied',ad_user_data:_c.ads?'granted':'denied',ad_personalization:_c.ads?'granted':'denied',analytics_storage:_c.analytics?'granted':'denied'});}}}catch(e){}
  gtag('js',new Date());gtag('config','G-1EG5HKVW09');
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1EG5HKVW09"></script>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
"@

$files = Get-ChildItem -Path $base -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|tmp)\\' }

$installed   = 0   # current version already present, no work
$upgraded    = 0   # replaced an older snippet
$inserted    = 0   # injected after <head> (had no snippet at all)
$nohead      = 0

foreach ($f in $files) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)

  if ($html -match 'OneSlider core v3') {
    $installed++
    continue
  }

  $matched = $false
  foreach ($old in $oldBlocks) {
    if ($html.Contains($old)) {
      $html = $html.Replace($old, $newBlock)
      [System.IO.File]::WriteAllText($f.FullName, $html, [System.Text.Encoding]::UTF8)
      $upgraded++
      $matched = $true
      break
    }
  }
  if ($matched) { continue }

  # No snippet found — try to inject after <head>.
  $newHtml = [regex]::Replace(
    $html,
    '(?i)(<head\b[^>]*>)',
    { param($m) $m.Groups[1].Value + $newBlock },
    1
  )
  if ($newHtml -ne $html) {
    [System.IO.File]::WriteAllText($f.FullName, $newHtml, [System.Text.Encoding]::UTF8)
    $inserted++
  } else {
    $nohead++
  }
}

Write-Host "Already current: $installed"
Write-Host "Upgraded:        $upgraded"
Write-Host "Newly inserted:  $inserted"
Write-Host "No head tag:     $nohead"

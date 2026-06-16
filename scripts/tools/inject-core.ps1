# inject-core.ps1
# Installs / updates the OneSliders core snippet on every HTML page.
# Idempotent. The current target is v4 — a minimal 2-line external load.

$base = "C:\Users\AndersEriksson\3DF\OneSlider"

# ---- Snippet versions we recognise (oldest first) ----
# v1: original gtag-only snippet (inject-gtag.ps1)
# v2: Consent Mode v2 inline (no localStorage pre-apply)
# v3: Consent Mode v2 inline + localStorage pre-apply (the "core v3" comment)
# Anything matching any of these → replaced by $newBlock (v4) below.
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

$oldBlocks += @"

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

# ---- Current snippet (v4) — fully centralised ----
# Everything (dataLayer init, Consent Mode default, localStorage pre-apply,
# gtag.js loader, banner UI, geo lookup) lives in oneslider-core.js.
# The HTML touches only two lines, and they NEVER need to change again.
#
# Sync load is correct here: the file is small (~25 KB minified-ish, cached
# after first hit), and it must run BEFORE gtag.js for Consent Mode v2.
$newBlock = @"

  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script src="/assets/js/oneslider-core.js"></script>
"@

$files = Get-ChildItem -Path $base -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|tmp)\\' }

$installed   = 0
$upgraded    = 0
$inserted    = 0
$nohead      = 0

foreach ($f in $files) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)

  if ($html -match 'OneSlider core v4') {
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

  # No prior snippet — inject right after <head>
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

Write-Host "Already current (v4): $installed"
Write-Host "Upgraded to v4:       $upgraded"
Write-Host "Newly inserted:       $inserted"
Write-Host "No <head> tag:        $nohead"

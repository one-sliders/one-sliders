$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$outRoot = Join-Path $repoRoot 'content\locations\north-america'

function Svg($body, $label) {
@"
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 64 48" role="img" aria-label="$label flag">
  $body
  <rect x=".5" y=".5" width="63" height="47" fill="none" stroke="rgba(16,24,32,.18)"/>
</svg>
"@
}

$star = '<path d="M0,-4 1.18,-1.62 3.8,-1.24 1.9,.62 2.35,3.24 0,2 -2.35,3.24 -1.9,.62 -3.8,-1.24 -1.18,-1.62Z"/>'

$flags = @{
  'antigua-and-barbuda' = Svg @'
<rect width="64" height="48" fill="#ce1126"/>
<path d="M0 0h64L32 48z" fill="#fff"/>
<path d="M7 0h50L32 37z" fill="#0072c6"/>
<path d="M13 0h38L32 26z" fill="#000"/>
<path d="M16 30h32v18H16z" fill="#fff"/>
<path d="M13 0h38L32 22z" fill="#000"/>
<g transform="translate(32 18)" fill="#fcd116">
  <circle r="6"/>
  <g stroke="#fcd116" stroke-width="2">
    <path d="M0 -12v6M0 6v7M-12 0h6M6 0h12M-8 -8l4 4M8 -8l-4 4M-8 8l4-4M8 8l-4-4"/>
  </g>
</g>
'@ 'Antigua and Barbuda'

  'bahamas' = Svg @'
<rect width="64" height="48" fill="#00abc9"/>
<rect y="16" width="64" height="16" fill="#fcd116"/>
<path d="M0 0 28 24 0 48z" fill="#000"/>
'@ 'Bahamas'

  'barbados' = Svg @'
<rect width="64" height="48" fill="#00267f"/>
<rect x="21.33" width="21.34" height="48" fill="#ffc726"/>
<path d="M32 15v19M25 19c3 2 4 4 4 7M39 19c-3 2-4 4-4 7M28 15h8M32 34l-3 4M32 34l3 4" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
'@ 'Barbados'

  'belize' = Svg @'
<rect width="64" height="48" fill="#003f87"/>
<rect width="64" height="5" fill="#ce1126"/>
<rect y="43" width="64" height="5" fill="#ce1126"/>
<circle cx="32" cy="24" r="12.5" fill="#fff"/>
<circle cx="32" cy="24" r="11" fill="none" stroke="#2f8f43" stroke-width="1.4"/>
<path d="M32 12v10" stroke="#7b4b25" stroke-width="2"/>
<path d="M26 18c3-6 9-6 12 0-4-2-8-2-12 0z" fill="#2f8f43"/>
<path d="M24 25h16v8H24z" fill="#c7a35a"/>
<path d="M26 25h12v6H26z" fill="#e6d5a8"/>
<path d="M20 32c4-2 20-2 24 0" stroke="#2f8f43" stroke-width="1.4" fill="none"/>
'@ 'Belize'

  'canada' = Svg @'
<rect width="64" height="48" fill="#fff"/>
<rect width="16" height="48" fill="#d52b1e"/>
<rect x="48" width="16" height="48" fill="#d52b1e"/>
<path d="M32 9l2.6 6 5.8-2-2.8 6 5.4 2.5-6.2 2 2.1 6-5.2-3.3.6 8.8h-4.6l.6-8.8-5.2 3.3 2.1-6-6.2-2 5.4-2.5-2.8-6 5.8 2z" fill="#d52b1e"/>
'@ 'Canada'

  'costa-rica' = Svg @'
<rect width="64" height="48" fill="#002b7f"/>
<rect y="8" width="64" height="32" fill="#fff"/>
<rect y="16" width="64" height="16" fill="#ce1126"/>
'@ 'Costa Rica'

  'cuba' = Svg @'
<rect width="64" height="48" fill="#002a8f"/>
<rect y="9.6" width="64" height="9.6" fill="#fff"/>
<rect y="28.8" width="64" height="9.6" fill="#fff"/>
<path d="M0 0 32 24 0 48z" fill="#cf142b"/>
<g transform="translate(12.5 24)" fill="#fff">
  <path d="M0,-6 1.76,-2.43 5.71,-1.85 2.85,.93 3.53,4.85 0,3 -3.53,4.85 -2.85,.93 -5.71,-1.85 -1.76,-2.43Z"/>
</g>
'@ 'Cuba'

  'dominica' = Svg @'
<rect width="64" height="48" fill="#006b3f"/>
<rect x="27" width="10" height="48" fill="#fcd116"/>
<rect y="19" width="64" height="10" fill="#fcd116"/>
<rect x="29.5" width="5" height="48" fill="#000"/>
<rect y="21.5" width="64" height="5" fill="#000"/>
<rect x="31" width="2" height="48" fill="#fff"/>
<rect y="23" width="64" height="2" fill="#fff"/>
<circle cx="32" cy="24" r="10" fill="#d41c30"/>
<circle cx="32" cy="24" r="4.5" fill="#6c3"/>
<path d="M30 22c3-5 8-1 5 3-1.5 2-4 2-6 0z" fill="#6b2e83"/>
<g fill="#fcd116">
  <circle cx="32" cy="14" r="1.2"/><circle cx="38" cy="16" r="1.2"/><circle cx="42" cy="21" r="1.2"/><circle cx="42" cy="27" r="1.2"/><circle cx="38" cy="32" r="1.2"/><circle cx="32" cy="34" r="1.2"/><circle cx="26" cy="32" r="1.2"/><circle cx="22" cy="27" r="1.2"/><circle cx="22" cy="21" r="1.2"/><circle cx="26" cy="16" r="1.2"/>
</g>
'@ 'Dominica'

  'dominican-republic' = Svg @'
<rect width="64" height="48" fill="#fff"/>
<rect width="27" height="18" fill="#002d62"/>
<rect x="37" width="27" height="18" fill="#ce1126"/>
<rect y="30" width="27" height="18" fill="#ce1126"/>
<rect x="37" y="30" width="27" height="18" fill="#002d62"/>
<rect x="29" width="6" height="48" fill="#fff"/>
<rect y="20" width="64" height="8" fill="#fff"/>
<circle cx="32" cy="24" r="5" fill="#fff" stroke="#0b7a3b" stroke-width="1"/>
<path d="M29 25h6v3h-6z" fill="#ce1126"/><path d="M29 21h6v4h-6z" fill="#002d62"/>
'@ 'Dominican Republic'

  'el-salvador' = Svg @'
<rect width="64" height="48" fill="#0047ab"/>
<rect y="16" width="64" height="16" fill="#fff"/>
<circle cx="32" cy="24" r="6" fill="#f4d35e" stroke="#2a7f62" stroke-width="1"/>
<path d="M32 18l5 9H27z" fill="#7fc8a9"/>
<circle cx="32" cy="24" r="1.2" fill="#0047ab"/>
'@ 'El Salvador'

  'grenada' = Svg @'
<rect width="64" height="48" fill="#ce1126"/>
<rect x="7" y="7" width="50" height="34" fill="#fcd116"/>
<path d="M7 7h50L32 24zM7 41h50L32 24z" fill="#007a5e"/>
<circle cx="32" cy="24" r="7" fill="#ce1126"/>
<g transform="translate(32 24)" fill="#fcd116"><path d="M0,-5 1.47,-2.02 4.76,-1.55 2.38,.77 2.94,4.05 0,2.5 -2.94,4.05 -2.38,.77 -4.76,-1.55 -1.47,-2.02Z"/></g>
<g fill="#fcd116"><circle cx="16" cy="4" r="1.6"/><circle cx="32" cy="4" r="1.6"/><circle cx="48" cy="4" r="1.6"/><circle cx="16" cy="44" r="1.6"/><circle cx="32" cy="44" r="1.6"/><circle cx="48" cy="44" r="1.6"/></g>
<ellipse cx="11" cy="30" rx="3" ry="5" fill="#fcd116"/><path d="M9 30c2 0 4 1 5 3" stroke="#007a5e" fill="none"/>
'@ 'Grenada'

  'guatemala' = Svg @'
<rect width="64" height="48" fill="#4997d0"/>
<rect x="21.33" width="21.34" height="48" fill="#fff"/>
<circle cx="32" cy="24" r="6" fill="#f5d76e" stroke="#2a7f62" stroke-width="1"/>
<path d="M27 27c4-6 6-6 10 0" stroke="#2a7f62" stroke-width="2" fill="none"/>
<path d="M28 21h8v5h-8z" fill="#7fc8a9"/>
'@ 'Guatemala'

  'haiti' = Svg @'
<rect width="64" height="24" fill="#00209f"/>
<rect y="24" width="64" height="24" fill="#d21034"/>
<rect x="23" y="17" width="18" height="14" fill="#fff"/>
<path d="M32 18l5 8H27z" fill="#2a7f62"/>
<rect x="27" y="26" width="10" height="2" fill="#8b5a2b"/>
'@ 'Haiti'

  'honduras' = Svg @'
<rect width="64" height="48" fill="#18a7d8"/>
<rect y="16" width="64" height="16" fill="#fff"/>
<g fill="#18a7d8">
  <circle cx="25" cy="21" r="1.5"/><circle cx="39" cy="21" r="1.5"/><circle cx="32" cy="24" r="1.5"/><circle cx="25" cy="27" r="1.5"/><circle cx="39" cy="27" r="1.5"/>
</g>
'@ 'Honduras'

  'jamaica' = Svg @'
<rect width="64" height="48" fill="#009b3a"/>
<path d="M0 0 64 48M64 0 0 48" stroke="#fed100" stroke-width="12"/>
<path d="M0 0 64 48M64 0 0 48" stroke="#000" stroke-width="7"/>
<path d="M0 0 28 24 0 48zM64 0 36 24 64 48z" fill="#000"/>
'@ 'Jamaica'

  'mexico' = Svg @'
<rect width="64" height="48" fill="#ce1126"/>
<rect width="21.33" height="48" fill="#006847"/>
<rect x="21.33" width="21.34" height="48" fill="#fff"/>
<circle cx="32" cy="24" r="5.5" fill="#b58a42"/>
<path d="M29 23c3-5 8-2 6 2-2-2-4-1-6 1z" fill="#6b4b1e"/>
<path d="M31 29c-3-2-4-4-4-7M33 29c3-2 4-4 4-7" stroke="#0b7a3b" stroke-width="1.4" fill="none"/>
'@ 'Mexico'

  'nicaragua' = Svg @'
<rect width="64" height="48" fill="#0067c6"/>
<rect y="16" width="64" height="16" fill="#fff"/>
<circle cx="32" cy="24" r="6" fill="#f4d35e" stroke="#0067c6" stroke-width="1"/>
<path d="M32 18l5 9H27z" fill="#7fc8a9"/>
<circle cx="32" cy="22" r="1.5" fill="#0067c6"/>
'@ 'Nicaragua'

  'panama' = Svg @'
<rect width="64" height="48" fill="#fff"/>
<rect x="32" width="32" height="24" fill="#d21034"/>
<rect y="24" width="32" height="24" fill="#005293"/>
<g transform="translate(16 12)" fill="#005293"><path d="M0,-5 1.47,-2.02 4.76,-1.55 2.38,.77 2.94,4.05 0,2.5 -2.94,4.05 -2.38,.77 -4.76,-1.55 -1.47,-2.02Z"/></g>
<g transform="translate(48 36)" fill="#d21034"><path d="M0,-5 1.47,-2.02 4.76,-1.55 2.38,.77 2.94,4.05 0,2.5 -2.94,4.05 -2.38,.77 -4.76,-1.55 -1.47,-2.02Z"/></g>
'@ 'Panama'

  'saint-kitts-and-nevis' = Svg @'
<rect width="64" height="48" fill="#ce1126"/>
<path d="M0 0h64L0 48z" fill="#009739"/>
<path d="M64 0v48H0z" fill="#ce1126"/>
<path d="M-7 50 57 -2M7 53 71 1" stroke="#fcd116" stroke-width="10"/>
<path d="M0 52 64 0" stroke="#000" stroke-width="10"/>
<g fill="#fff"><g transform="translate(25 29) rotate(-39)"><path d="M0,-4 1.18,-1.62 3.8,-1.24 1.9,.62 2.35,3.24 0,2 -2.35,3.24 -1.9,.62 -3.8,-1.24 -1.18,-1.62Z"/></g><g transform="translate(39 19) rotate(-39)"><path d="M0,-4 1.18,-1.62 3.8,-1.24 1.9,.62 2.35,3.24 0,2 -2.35,3.24 -1.9,.62 -3.8,-1.24 -1.18,-1.62Z"/></g></g>
'@ 'Saint Kitts and Nevis'

  'saint-lucia' = Svg @'
<rect width="64" height="48" fill="#66ccff"/>
<path d="M32 7 48 40H16z" fill="#fff"/>
<path d="M32 10 45 39H19z" fill="#000"/>
<path d="M32 20 45 40H19z" fill="#fcd116"/>
'@ 'Saint Lucia'

  'saint-vincent-and-the-grenadines' = Svg @'
<rect width="64" height="48" fill="#009e60"/>
<rect width="16" height="48" fill="#0072c6"/>
<rect x="16" width="32" height="48" fill="#fcd116"/>
<g fill="#009e60">
  <path d="M32 17l5 5-5 5-5-5z"/>
  <path d="M26 26l5 5-5 5-5-5z"/>
  <path d="M38 26l5 5-5 5-5-5z"/>
</g>
'@ 'Saint Vincent and the Grenadines'

  'trinidad-and-tobago' = Svg @'
<rect width="64" height="48" fill="#ce1126"/>
<path d="M-8 -2 72 58" stroke="#fff" stroke-width="14"/>
<path d="M-8 -2 72 58" stroke="#000" stroke-width="9"/>
'@ 'Trinidad and Tobago'

  'usa' = Svg @'
<rect width="64" height="48" fill="#fff"/>
<g fill="#b22234">
  <rect y="0" width="64" height="3.69"/><rect y="7.38" width="64" height="3.69"/><rect y="14.77" width="64" height="3.69"/><rect y="22.15" width="64" height="3.69"/><rect y="29.54" width="64" height="3.69"/><rect y="36.92" width="64" height="3.69"/><rect y="44.31" width="64" height="3.69"/>
</g>
<rect width="28" height="25.85" fill="#3c3b6e"/>
<g fill="#fff">
  <circle cx="3" cy="3" r=".75"/><circle cx="8" cy="3" r=".75"/><circle cx="13" cy="3" r=".75"/><circle cx="18" cy="3" r=".75"/><circle cx="23" cy="3" r=".75"/>
  <circle cx="5.5" cy="6" r=".75"/><circle cx="10.5" cy="6" r=".75"/><circle cx="15.5" cy="6" r=".75"/><circle cx="20.5" cy="6" r=".75"/><circle cx="25.5" cy="6" r=".75"/>
  <circle cx="3" cy="9" r=".75"/><circle cx="8" cy="9" r=".75"/><circle cx="13" cy="9" r=".75"/><circle cx="18" cy="9" r=".75"/><circle cx="23" cy="9" r=".75"/>
  <circle cx="5.5" cy="12" r=".75"/><circle cx="10.5" cy="12" r=".75"/><circle cx="15.5" cy="12" r=".75"/><circle cx="20.5" cy="12" r=".75"/><circle cx="25.5" cy="12" r=".75"/>
  <circle cx="3" cy="15" r=".75"/><circle cx="8" cy="15" r=".75"/><circle cx="13" cy="15" r=".75"/><circle cx="18" cy="15" r=".75"/><circle cx="23" cy="15" r=".75"/>
  <circle cx="5.5" cy="18" r=".75"/><circle cx="10.5" cy="18" r=".75"/><circle cx="15.5" cy="18" r=".75"/><circle cx="20.5" cy="18" r=".75"/><circle cx="25.5" cy="18" r=".75"/>
  <circle cx="3" cy="21" r=".75"/><circle cx="8" cy="21" r=".75"/><circle cx="13" cy="21" r=".75"/><circle cx="18" cy="21" r=".75"/><circle cx="23" cy="21" r=".75"/>
</g>
'@ 'USA'
}

foreach ($slug in $flags.Keys) {
  $dir = Join-Path $outRoot "$slug\img"
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $path = Join-Path $dir 'flag.svg'
  [System.IO.File]::WriteAllText($path, $flags[$slug], (New-Object System.Text.UTF8Encoding $false))
  Write-Host "OK: north-america\$slug\img\flag.svg"
}

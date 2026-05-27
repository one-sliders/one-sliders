param(
  [Parameter(Mandatory=$true)][string]$Continent,
  [Parameter(Mandatory=$true)][string]$Slug
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$generatedRoot = Join-Path $env:USERPROFILE '.codex\generated_images\019e6a15-6109-7652-a762-713315f9324f'
if (-not (Test-Path $generatedRoot)) {
  $generatedRoot = Join-Path $env:USERPROFILE '.codex\generated_images'
}
$source = Get-ChildItem $generatedRoot -Recurse -File -Filter '*.png' |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $source) {
  throw "No generated PNG found under $generatedRoot"
}

$out = Join-Path $repoRoot "content\locations\$Continent\$Slug\img\$Slug-hero.png"
if (-not (Test-Path (Split-Path $out -Parent))) {
  New-Item -ItemType Directory -Force -Path (Split-Path $out -Parent) | Out-Null
}

$src = [System.Drawing.Image]::FromFile($source.FullName)
$targetW = 1200
$targetH = 630
$targetRatio = $targetW / $targetH
$srcRatio = $src.Width / $src.Height

if ($srcRatio -gt $targetRatio) {
  $cropH = $src.Height
  $cropW = [int]($cropH * $targetRatio)
  $cropX = [int](($src.Width - $cropW) / 2)
  $cropY = 0
} else {
  $cropW = $src.Width
  $cropH = [int]($cropW / $targetRatio)
  $cropX = 0
  $cropY = [int](($src.Height - $cropH) / 2)
}

$bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage(
  $src,
  [System.Drawing.Rectangle]::new(0, 0, $targetW, $targetH),
  [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH),
  [System.Drawing.GraphicsUnit]::Pixel
)
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Output "Wrote $out from $($source.FullName)"

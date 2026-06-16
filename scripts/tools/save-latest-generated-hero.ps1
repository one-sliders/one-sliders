param(
  [Parameter(Mandatory=$true)][string]$Slug
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$generatedDir = Join-Path $env:USERPROFILE ".codex\generated_images\019e6454-a653-70e1-b243-eca3fd3abd3f"
$source = Get-ChildItem $generatedDir -Filter *.png | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $source) {
  throw "No generated image found in $generatedDir"
}

$out = Join-Path (Resolve-Path ".").Path "content\categories\drinks\img\$Slug-hero.png"
$src = [System.Drawing.Image]::FromFile($source.FullName)
$bmp = New-Object System.Drawing.Bitmap 1200, 630
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, 1200, 630), [System.Drawing.Rectangle]::new(0, 0, $src.Width, $src.Height), [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Output "Wrote $out from $($source.FullName)"

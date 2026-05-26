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

$outDir = Join-Path (Resolve-Path ".").Path "content\categories\drinks\img"
$src = [System.Drawing.Image]::FromFile($source.FullName)

function Save-ImageSize($src, $path, $width, $height) {
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $tinyW = [Math]::Max(24, [Math]::Round($width / 12))
  $tinyH = [Math]::Max(24, [Math]::Round($height / 12))
  $tiny = New-Object System.Drawing.Bitmap $tinyW, $tinyH
  $tg = [System.Drawing.Graphics]::FromImage($tiny)
  $tg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $tg.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, $tinyW, $tinyH), [System.Drawing.Rectangle]::new(0, 0, $src.Width, $src.Height), [System.Drawing.GraphicsUnit]::Pixel)
  $tg.Dispose()

  $g.DrawImage($tiny, [System.Drawing.Rectangle]::new(0, 0, $width, $height))
  $wash = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(34, 255, 255, 255))
  $g.FillRectangle($wash, 0, 0, $width, $height)
  $wash.Dispose()
  $tiny.Dispose()

  $scale = [Math]::Min($width / $src.Width, $height / $src.Height)
  $drawW = [Math]::Round($src.Width * $scale)
  $drawH = [Math]::Round($src.Height * $scale)
  $drawX = [Math]::Round(($width - $drawW) / 2)
  $drawY = [Math]::Round(($height - $drawH) / 2)

  $g.DrawImage($src, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawW, $drawH), [System.Drawing.Rectangle]::new(0, 0, $src.Width, $src.Height), [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Save-ImageSize $src (Join-Path $outDir "$Slug-hero.png") 1200 630
Save-ImageSize $src (Join-Path $outDir "$Slug-mini.png") 400 300
$src.Dispose()

Write-Output "Wrote $Slug from $($source.FullName)"

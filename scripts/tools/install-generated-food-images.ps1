$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $env:USERPROFILE '.codex/generated_images/019e635a-a4ee-7633-96f3-667f86d720c6'
$outDir = Join-Path $root 'content/categories/food/img'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$slugs = @(
  'bacalhau','baguette','banitsa','barbagiuan','borscht','bratwurst','bryndzove-halusky','byrek','cepelinai','cevapi',
  'draniki','farikal','fish-and-chips','flija','fondue','goulash','grey-peas-with-bacon','halloumi','irish-stew','judd-mat-gaardebounen',
  'karjalanpiirakka','kasknopfle','kebab','khachapuri','khorovats','lamb-soup','mamaliga','meatballs','moules-frites','moussaka',
  'njeguski-prsut','paella','pastizzi','peka','pierogi','pizza','pljeskavica','plov','potica','roman-pasta',
  'sarmale','sm-rrebr-d','street-food','stroopwafel','svickova','tavce-gravce','torta-tre-monti','trinxat','verivorst','wiener-schnitzel'
)

$files = Get-ChildItem $srcDir -Filter *.png | Sort-Object LastWriteTime
if ($files.Count -ne $slugs.Count) {
  throw "Expected $($slugs.Count) generated files, found $($files.Count)"
}

function Save-Crop([string]$src, [string]$dest, [int]$targetW, [int]$targetH) {
  $img = [Drawing.Image]::FromFile($src)
  try {
    $srcRatio = $img.Width / $img.Height
    $targetRatio = $targetW / $targetH
    if ($srcRatio -gt $targetRatio) {
      $cropH = $img.Height
      $cropW = [int]($img.Height * $targetRatio)
      $cropX = [int](($img.Width - $cropW) / 2)
      $cropY = 0
    } else {
      $cropW = $img.Width
      $cropH = [int]($img.Width / $targetRatio)
      $cropX = 0
      $cropY = [int](($img.Height - $cropH) / 2)
    }
    $bmp = [Drawing.Bitmap]::new($targetW, $targetH)
    try {
      $g = [Drawing.Graphics]::FromImage($bmp)
      try {
        $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, [Drawing.Rectangle]::new(0,0,$targetW,$targetH), [Drawing.Rectangle]::new($cropX,$cropY,$cropW,$cropH), [Drawing.GraphicsUnit]::Pixel)
      } finally {
        $g.Dispose()
      }
      $bmp.Save($dest, [Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bmp.Dispose()
    }
  } finally {
    $img.Dispose()
  }
}

for ($i = 0; $i -lt $slugs.Count; $i++) {
  $slug = $slugs[$i]
  $file = $files[$i].FullName
  Save-Crop $file (Join-Path $outDir "$slug-hero.png") 1200 630
  Save-Crop $file (Join-Path $outDir "$slug-mini.png") 400 300
}

"installed_food_images=$($slugs.Count)"

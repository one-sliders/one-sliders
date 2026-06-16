param(
  [int]$Width = 1200,
  [int]$Height = 630
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$locRoot = Join-Path $repoRoot 'content\locations'

Add-Type -AssemblyName System.Drawing

function Get-DataBlock($scriptName, $functionName) {
  $sourceScript = Join-Path $repoRoot $scriptName
  $sourceText = [System.IO.File]::ReadAllText($sourceScript, [System.Text.Encoding]::UTF8)
  $markerIndex = $sourceText.IndexOf("function $functionName")
  if ($markerIndex -lt 0) { throw "Could not find $functionName in $sourceScript" }
  return $sourceText.Substring(0, $markerIndex)
}

Invoke-Expression (Get-DataBlock 'rebuild-asia-countries.ps1' 'Build-AsiaPage')
$AsiaData = $CD.Clone()
Invoke-Expression (Get-DataBlock 'rebuild-oceania-countries.ps1' 'Build-OcPage')
$OceaniaData = $CD.Clone()
$locRoot = Join-Path $repoRoot 'content\locations'

function New-Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function To-Hex($color) {
  return ('#{0:X2}{1:X2}{2:X2}' -f $color.R, $color.G, $color.B)
}

function Blend-Color($a, $b, [double]$amount) {
  $r = [int]($a.R + (($b.R - $a.R) * $amount))
  $g = [int]($a.G + (($b.G - $a.G) * $amount))
  $bl = [int]($a.B + (($b.B - $a.B) * $amount))
  return [System.Drawing.Color]::FromArgb($r, $g, $bl)
}

function Brightness($color) {
  return (($color.R * 299) + ($color.G * 587) + ($color.B * 114)) / 1000
}

function Get-Seed($text) {
  $md5 = [System.Security.Cryptography.MD5]::Create()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $hash = $md5.ComputeHash($bytes)
  $seed = [BitConverter]::ToInt32($hash, 0)
  $md5.Dispose()
  return [Math]::Abs($seed)
}

function Normalize-Hex($hex) {
  $value = $hex.Trim().ToLowerInvariant()
  if ($value.Length -eq 4) {
    return '#' + $value[1] + $value[1] + $value[2] + $value[2] + $value[3] + $value[3]
  }
  return $value
}

function Get-FlagPalette($flagPath) {
  $fallback = @('#17384c', '#5f7d72', '#c7a366')
  if (-not (Test-Path $flagPath)) { return $fallback }
  $svg = [System.IO.File]::ReadAllText($flagPath, [System.Text.Encoding]::UTF8)
  $counts = @{}
  foreach ($m in [regex]::Matches($svg, '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b')) {
    $hex = Normalize-Hex $m.Value
    if (-not $counts.ContainsKey($hex)) { $counts[$hex] = 0 }
    $counts[$hex]++
  }
  $colors = @()
  foreach ($hex in ($counts.Keys | Sort-Object { -$counts[$_] })) {
    try {
      $c = New-Color $hex
      $b = Brightness $c
      if ($b -gt 238 -or $b -lt 12) { continue }
      $colors += $hex
    } catch {}
  }
  foreach ($hex in $fallback) {
    if ($colors.Count -ge 3) { break }
    $colors += $hex
  }
  return @($colors | Select-Object -First 3)
}

function New-Brush($color, [int]$alpha = 255) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $color))
}

function New-Pen($color, [float]$width = 1, [int]$alpha = 255) {
  return New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($alpha, $color), $width)
}

function Fill-Poly($g, $brush, $points) {
  $pts = @($points | ForEach-Object { [System.Drawing.PointF]::new([float]$_[0], [float]$_[1]) })
  $g.FillPolygon($brush, $pts)
}

function Pt($x, $y) {
  return @([double]$x, [double]$y)
}

function Fill-Ellipse($g, $color, $x, $y, $w, $h, [int]$alpha = 255) {
  $brush = New-Brush $color $alpha
  $g.FillEllipse($brush, [float]$x, [float]$y, [float]$w, [float]$h)
  $brush.Dispose()
}

function Fill-Rect($g, $color, $x, $y, $w, $h, [int]$alpha = 255) {
  $brush = New-Brush $color $alpha
  $g.FillRectangle($brush, [float]$x, [float]$y, [float]$w, [float]$h)
  $brush.Dispose()
}

function Draw-SoftTexture($g, $w, $h, $rand) {
  for ($i = 0; $i -lt 190; $i++) {
    $alpha = $rand.Next(8, 24)
    $color = if ($i % 2 -eq 0) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::Black }
    $pen = New-Pen $color ($rand.Next(1, 4)) $alpha
    $x1 = $rand.Next(-80, $w)
    $y1 = $rand.Next(0, $h)
    $x2 = $x1 + $rand.Next(140, 460)
    $y2 = $y1 + $rand.Next(-40, 40)
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
  }
}

function Draw-Clouds($g, $w, $h, $rand) {
  for ($i = 0; $i -lt 9; $i++) {
    $cx = $rand.Next(-100, $w - 100)
    $cy = $rand.Next(35, [int]($h * 0.38))
    $cw = $rand.Next(140, 300)
    $ch = $rand.Next(26, 70)
    Fill-Ellipse $g ([System.Drawing.Color]::White) $cx $cy $cw $ch 34
    Fill-Ellipse $g ([System.Drawing.Color]::White) ($cx + $cw * .25) ($cy - $ch * .22) ($cw * .55) ($ch * 1.2) 26
  }
}

function Draw-Sky($g, $w, $h, $palette, $rand) {
  $c1 = New-Color $palette[0]
  $c2 = New-Color $palette[1]
  $skyTop = Blend-Color $c1 ([System.Drawing.Color]::Black) .36
  $skyLow = Blend-Color $c2 ([System.Drawing.Color]::White) .54
  $rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $skyTop, $skyLow, 90
  $g.FillRectangle($bg, $rect)
  $bg.Dispose()

  $sun = Blend-Color (New-Color $palette[2]) ([System.Drawing.Color]::White) .45
  Fill-Ellipse $g $sun ($w * .72) ($h * .13) 120 120 85
  Fill-Ellipse $g ([System.Drawing.Color]::White) ($w * .75) ($h * .16) 56 56 42
  Draw-Clouds $g $w $h $rand
}

function Draw-Water($g, $w, $h, $palette, $rand, [double]$startY = .56) {
  $waterTop = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::White) .30
  $waterBottom = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .26
  $y = [int]($h * $startY)
  $rect = [System.Drawing.Rectangle]::new(0, $y, $w, $h - $y)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $waterTop, $waterBottom, 90
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()
  for ($i = 0; $i -lt 50; $i++) {
    $pen = New-Pen ([System.Drawing.Color]::White) ($rand.Next(1, 3)) $rand.Next(28, 80)
    $yy = $rand.Next($y + 10, $h - 20)
    $x = $rand.Next(-120, $w)
    $g.DrawLine($pen, $x, $yy, $x + $rand.Next(90, 310), $yy + $rand.Next(-2, 3))
    $pen.Dispose()
  }
}

function Draw-Mountains($g, $w, $h, $palette, $rand, [bool]$snow = $true) {
  $w = [int]$w
  $h = [int]$h
  $base = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .22
  $mid = Blend-Color (New-Color $palette[1]) ([System.Drawing.Color]::Black) .15
  $front = Blend-Color (New-Color $palette[2]) ([System.Drawing.Color]::Black) .12
  $b1 = New-Brush $base 210
  $b2 = New-Brush $mid 225
  $b3 = New-Brush $front 235
  Fill-Poly $g $b1 @((Pt 0 ($h * .66)),(Pt ($w * .18) ($h * .30)),(Pt ($w * .38) ($h * .67)),(Pt ($w * .56) ($h * .25)),(Pt ($w * .80) ($h * .67)),(Pt $w ($h * .36)),(Pt $w $h),(Pt 0 $h))
  Fill-Poly $g $b2 @((Pt 0 ($h * .72)),(Pt ($w * .18) ($h * .48)),(Pt ($w * .35) ($h * .72)),(Pt ($w * .51) ($h * .40)),(Pt ($w * .68) ($h * .72)),(Pt ($w * .86) ($h * .46)),(Pt $w ($h * .70)),(Pt $w $h),(Pt 0 $h))
  Fill-Poly $g $b3 @((Pt 0 ($h * .80)),(Pt ($w * .20) ($h * .57)),(Pt ($w * .40) ($h * .81)),(Pt ($w * .62) ($h * .54)),(Pt ($w * .82) ($h * .82)),(Pt $w ($h * .62)),(Pt $w $h),(Pt 0 $h))
  if ($snow) {
    $snowBrush = New-Brush ([System.Drawing.Color]::White) 170
    Fill-Poly $g $snowBrush @((Pt ($w * .49) ($h * .40)),(Pt ($w * .56) ($h * .25)),(Pt ($w * .63) ($h * .40)),(Pt ($w * .58) ($h * .37)),(Pt ($w * .55) ($h * .42)))
    Fill-Poly $g $snowBrush @((Pt ($w * .12) ($h * .43)),(Pt ($w * .18) ($h * .30)),(Pt ($w * .25) ($h * .43)),(Pt ($w * .19) ($h * .40)))
    $snowBrush.Dispose()
  }
  $b1.Dispose(); $b2.Dispose(); $b3.Dispose()
  Draw-Water $g $w $h $palette $rand .76
}

function Draw-Coast($g, $w, $h, $palette, $rand, [bool]$reef = $false) {
  Draw-Water $g $w $h $palette $rand .44
  $sand = Blend-Color (New-Color $palette[2]) ([System.Drawing.Color]::White) .46
  $green = Blend-Color (New-Color $palette[1]) ([System.Drawing.Color]::Black) .18
  $islandBrush = New-Brush $sand 235
  $greenBrush = New-Brush $green 220
  Fill-Poly $g $islandBrush @((Pt -50 ($h * .78)),(Pt ($w * .22) ($h * .64)),(Pt ($w * .52) ($h * .70)),(Pt ($w * .72) ($h * .83)),(Pt $w ($h * .72)),(Pt $w $h),(Pt 0 $h))
  Fill-Poly $g $greenBrush @((Pt ($w * .04) ($h * .66)),(Pt ($w * .22) ($h * .56)),(Pt ($w * .45) ($h * .66)),(Pt ($w * .22) ($h * .69)))
  Fill-Poly $g $greenBrush @((Pt ($w * .74) ($h * .69)),(Pt ($w * .91) ($h * .59)),(Pt ($w * 1.03) ($h * .71)),(Pt ($w * .90) ($h * .75)))
  if ($reef) {
    for ($i = 0; $i -lt 13; $i++) {
      $c = Blend-Color (New-Color $palette[$i % 3]) ([System.Drawing.Color]::White) .38
      Fill-Ellipse $g $c ($rand.Next(70, $w - 130)) ($rand.Next([int]($h * .48), [int]($h * .70))) ($rand.Next(42, 120)) ($rand.Next(14, 36)) 98
    }
  }
  $trunk = New-Pen (Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .54) 8 190
  $leaf = New-Pen $green 7 185
  for ($p = 0; $p -lt 4; $p++) {
    $x = if ($p -lt 2) { $w * (.10 + .07 * $p) } else { $w * (.82 + .06 * ($p - 2)) }
    $y = $h * (.62 + .04 * ($p % 2))
    $g.DrawLine($trunk, $x, $y + 78, $x + 20, $y)
    for ($i = 0; $i -lt 5; $i++) {
      $angle = (-80 + $i * 40) * [Math]::PI / 180
      $g.DrawLine($leaf, $x + 20, $y, $x + 20 + [Math]::Cos($angle) * 70, $y + [Math]::Sin($angle) * 42)
    }
  }
  $trunk.Dispose(); $leaf.Dispose(); $islandBrush.Dispose(); $greenBrush.Dispose()
}

function Draw-Desert($g, $w, $h, $palette, $rand, [bool]$monolith = $false) {
  $sand1 = Blend-Color (New-Color $palette[2]) ([System.Drawing.Color]::White) .36
  $sand2 = Blend-Color (New-Color $palette[1]) ([System.Drawing.Color]::White) .25
  $dark = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .40
  $b1 = New-Brush $sand1 235
  $b2 = New-Brush $sand2 230
  Fill-Poly $g $b1 @((Pt 0 ($h * .64)),(Pt ($w * .24) ($h * .54)),(Pt ($w * .54) ($h * .66)),(Pt ($w * .82) ($h * .53)),(Pt $w ($h * .63)),(Pt $w $h),(Pt 0 $h))
  Fill-Poly $g $b2 @((Pt 0 ($h * .76)),(Pt ($w * .22) ($h * .68)),(Pt ($w * .50) ($h * .78)),(Pt ($w * .78) ($h * .66)),(Pt $w ($h * .77)),(Pt $w $h),(Pt 0 $h))
  if ($monolith) {
    $rock = New-Brush (Blend-Color (New-Color $palette[2]) ([System.Drawing.Color]::Black) .22) 230
    Fill-Poly $g $rock @((Pt ($w * .58) ($h * .30)),(Pt ($w * .72) ($h * .33)),(Pt ($w * .78) ($h * .70)),(Pt ($w * .53) ($h * .70)))
    $rock.Dispose()
  } else {
    Draw-DomeSilhouette $g $w $h $dark .59
  }
  $b1.Dispose(); $b2.Dispose()
}

function Draw-DomeSilhouette($g, $w, $h, $color, [double]$baseY = .68) {
  $brush = New-Brush $color 178
  $y = $h * $baseY
  Fill-Rect $g $color ($w * .14) ($y - 64) ($w * .18) 64 155
  Fill-Ellipse $g $color ($w * .16) ($y - 114) ($w * .14) 92 155
  Fill-Rect $g $color ($w * .35) ($y - 98) ($w * .26) 98 170
  Fill-Ellipse $g $color ($w * .38) ($y - 178) ($w * .20) 150 170
  Fill-Rect $g $color ($w * .68) ($y - 135) 34 135 165
  Fill-Ellipse $g $color ($w * .665) ($y - 162) 44 44 165
  $brush.Dispose()
}

function Draw-City($g, $w, $h, $palette, $rand, [bool]$harbor = $false) {
  if ($harbor) { Draw-Water $g $w $h $palette $rand .66 }
  $dark = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .44
  $light = Blend-Color (New-Color $palette[2]) ([System.Drawing.Color]::White) .25
  for ($i = 0; $i -lt 34; $i++) {
    $bw = $rand.Next(26, 78)
    $bh = $rand.Next(92, 270)
    $x = $rand.Next(-20, $w - 10)
    $y = [int]($h * .70) - $bh
    Fill-Rect $g $dark $x $y $bw $bh 190
    if ($i % 5 -eq 0) {
      Fill-Poly $g (New-Brush $dark 190) @((Pt $x $y),(Pt ($x + $bw / 2) ($y - 42)),(Pt ($x + $bw) $y))
    }
    for ($wx = $x + 7; $wx -lt $x + $bw - 7; $wx += 16) {
      for ($wy = $y + 14; $wy -lt $h * .68; $wy += 24) {
        if ($rand.NextDouble() -gt .50) { Fill-Rect $g $light $wx $wy 5 9 95 }
      }
    }
  }
  if ($harbor) { Draw-Sails $g $w $h }
}

function Draw-Sails($g, $w, $h) {
  $white = New-Brush ([System.Drawing.Color]::White) 210
  Fill-Poly $g $white @((Pt ($w * .18) ($h * .66)),(Pt ($w * .28) ($h * .42)),(Pt ($w * .34) ($h * .66)))
  Fill-Poly $g $white @((Pt ($w * .30) ($h * .66)),(Pt ($w * .44) ($h * .47)),(Pt ($w * .50) ($h * .66)))
  Fill-Poly $g $white @((Pt ($w * .46) ($h * .66)),(Pt ($w * .57) ($h * .51)),(Pt ($w * .62) ($h * .66)))
  $white.Dispose()
}

function Draw-Heritage($g, $w, $h, $palette, $rand, [string]$variant = 'temple') {
  Draw-Mountains $g $w $h $palette $rand $false
  $dark = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .48
  if ($variant -eq 'pagoda') {
    $brush = New-Brush $dark 190
    $cx = $w * .50
    $base = $h * .70
    for ($i = 0; $i -lt 5; $i++) {
      $levelW = 250 - $i * 34
      $levelY = $base - $i * 54
      Fill-Poly $g $brush @((Pt ($cx - $levelW / 2) $levelY),(Pt $cx ($levelY - 28)),(Pt ($cx + $levelW / 2) $levelY),(Pt ($cx + $levelW * .35) ($levelY + 18)),(Pt ($cx - $levelW * .35) ($levelY + 18)))
      Fill-Rect $g $dark ($cx - $levelW*.22) ($levelY + 18) ($levelW*.44) 34 170
    }
    $brush.Dispose()
  } elseif ($variant -eq 'torii') {
    Fill-Rect $g $dark ($w * .42) ($h * .43) ($w * .16) 22 190
    Fill-Rect $g $dark ($w * .39) ($h * .39) ($w * .22) 20 185
    Fill-Rect $g $dark ($w * .44) ($h * .45) 18 150 190
    Fill-Rect $g $dark ($w * .55) ($h * .45) 18 150 190
  } else {
    Draw-DomeSilhouette $g $w $h $dark .70
  }
}

function Draw-Forest($g, $w, $h, $palette, $rand) {
  $green1 = Blend-Color (New-Color $palette[1]) ([System.Drawing.Color]::Black) .20
  $green2 = Blend-Color (New-Color $palette[0]) ([System.Drawing.Color]::Black) .12
  Fill-Poly $g (New-Brush $green2 190) @((Pt 0 ($h * .65)),(Pt ($w * .26) ($h * .44)),(Pt ($w * .56) ($h * .64)),(Pt ($w * .78) ($h * .48)),(Pt $w ($h * .62)),(Pt $w $h),(Pt 0 $h))
  for ($i = 0; $i -lt 70; $i++) {
    $x = $rand.Next(-20, $w)
    $base = $rand.Next([int]($h * .62), [int]($h * .94))
    $size = $rand.Next(22, 72)
    $treeColor = if ($i % 2 -eq 0) { $green1 } else { $green2 }
    $treeAlpha = $rand.Next(140, 220)
    $brush = New-Brush $treeColor $treeAlpha
    Fill-Poly $g $brush @((Pt $x $base),(Pt ($x + $size / 2) ($base - $size)),(Pt ($x + $size) $base))
    $brush.Dispose()
  }
  Draw-Water $g $w $h $palette $rand .82
}

function Get-Scene($slug, $continent, $data) {
  $override = @{
    'australia' = 'coast-reef-sails'
    'new-zealand' = 'mountains'
    'japan' = 'fuji'
    'china' = 'pagoda'
    'india' = 'heritage'
    'nepal' = 'mountains'
    'bhutan' = 'mountains'
    'maldives' = 'islands-reef'
    'singapore' = 'city-harbor'
    'united-arab-emirates' = 'city-desert'
    'qatar' = 'city-desert'
    'saudi-arabia' = 'desert'
    'oman' = 'desert-coast'
    'jordan' = 'desert'
    'cambodia' = 'pagoda'
    'thailand' = 'pagoda'
    'myanmar' = 'pagoda'
    'south-korea' = 'city-mountains'
    'north-korea' = 'mountains'
    'mongolia' = 'steppe'
    'kazakhstan' = 'steppe'
    'kyrgyzstan' = 'mountains'
    'tajikistan' = 'mountains'
    'turkmenistan' = 'desert'
    'uzbekistan' = 'heritage'
  }
  if ($override.ContainsKey($slug)) { return $override[$slug] }
  if ($continent -eq 'oceania') {
    if ($slug -eq 'papua-new-guinea') { return 'forest-coast' }
    return 'islands-reef'
  }
  $text = ($data.r + ' ' + $data.intro + ' ' + ((@($data.wv) | ForEach-Object { $_[0] + ' ' + $_[1] }) -join ' ')).ToLowerInvariant()
  if ($text -match 'reef|island|beach|lagoon|coast|sea|ocean|harbour|harbor|coral') { return 'islands-reef' }
  if ($text -match 'desert|dune|wadi|arabian|gulf') { return 'desert' }
  if ($text -match 'mount|mountain|peak|himalaya|valley|alpine|fuji') { return 'mountains' }
  if ($text -match 'city|skyline|tower|metropolis|capital') { return 'city' }
  if ($text -match 'temple|monastery|mosque|shrine|pagoda|old city') { return 'heritage' }
  if ($text -match 'forest|rainforest|jungle|national park') { return 'forest' }
  return 'landscape'
}

function Draw-Hero($slug, $continent, $data, $outPath, $w, $h) {
  $w = [int]$w
  $h = [int]$h
  $flagPath = Join-Path $locRoot "$continent\$slug\img\flag.svg"
  $palette = Get-FlagPalette $flagPath
  $rand = New-Object System.Random (Get-Seed "$continent-$slug")
  $scene = Get-Scene $slug $continent $data

  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  Draw-Sky $g $w $h $palette $rand

  switch -Regex ($scene) {
    'fuji' { Draw-Heritage $g $w $h $palette $rand 'torii'; break }
    'pagoda' { Draw-Heritage $g $w $h $palette $rand 'pagoda'; break }
    'heritage' { Draw-Heritage $g $w $h $palette $rand 'dome'; break }
    'city-harbor|coast-reef-sails' { Draw-Coast $g $w $h $palette $rand $true; Draw-City $g $w $h $palette $rand $true; break }
    'city-desert' { Draw-Desert $g $w $h $palette $rand $false; Draw-City $g $w $h $palette $rand $false; break }
    'city-mountains' { Draw-Mountains $g $w $h $palette $rand $true; Draw-City $g $w $h $palette $rand $false; break }
    'city' { Draw-City $g $w $h $palette $rand $true; break }
    'desert-coast' { Draw-Coast $g $w $h $palette $rand $false; Draw-Desert $g $w $h $palette $rand $false; break }
    'desert' { Draw-Desert $g $w $h $palette $rand ($slug -eq 'australia'); break }
    'forest-coast' { Draw-Coast $g $w $h $palette $rand $false; Draw-Forest $g $w $h $palette $rand; break }
    'forest' { Draw-Forest $g $w $h $palette $rand; break }
    'islands-reef' { Draw-Coast $g $w $h $palette $rand $true; break }
    'steppe' { Draw-Mountains $g $w $h $palette $rand $false; break }
    'mountains' { Draw-Mountains $g $w $h $palette $rand $true; break }
    default { Draw-Mountains $g $w $h $palette $rand $false; Draw-Water $g $w $h $palette $rand .75 }
  }

  Draw-SoftTexture $g $w $h $rand

  $vignette = New-Object System.Drawing.Drawing2D.GraphicsPath
  $vignette.AddEllipse(-120, -80, $w + 240, $h + 160)
  $pathBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush $vignette
  $pathBrush.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
  $pathBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(85, 0, 0, 0))
  $g.FillRectangle($pathBrush, 0, 0, $w, $h)
  $pathBrush.Dispose()
  $vignette.Dispose()

  $dir = Split-Path $outPath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

function Generate-Continent($continent, $data) {
  $count = 0
  foreach ($slug in ($data.Keys | Sort-Object)) {
    $out = Join-Path $locRoot "$continent\$slug\img\$slug-hero.png"
    Draw-Hero $slug $continent $data[$slug] $out $Width $Height
    $count++
    Write-Host "  OK: $continent\$slug\img\$slug-hero.png"
  }
  return $count
}

$asiaCount = Generate-Continent 'asia' $AsiaData
$oceaniaCount = Generate-Continent 'oceania' $OceaniaData

Write-Host ''
Write-Host "Generated Asia heroes   : $asiaCount"
Write-Host "Generated Oceania heroes: $oceaniaCount"



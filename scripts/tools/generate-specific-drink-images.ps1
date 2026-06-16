Add-Type -AssemblyName System.Drawing

$outDir = Join-Path (Resolve-Path ".").Path "content\categories\drinks\img"

$drinks = @(
  @{Slug="champagne"; Label="Champagne"; Family="sparkling"; Bg1="#f7d97d"; Bg2="#fff5cf"; Accent="#c59a2d"},
  @{Slug="commandaria"; Label="Commandaria"; Family="dessert-wine"; Bg1="#5b241b"; Bg2="#c47b3a"; Accent="#f1c27d"},
  @{Slug="cremant"; Label="Cremant"; Family="sparkling"; Bg1="#e8cf81"; Bg2="#fff1bf"; Accent="#8f7a2e"},
  @{Slug="port-wine"; Label="Port wine"; Family="red-wine"; Bg1="#3a0f1b"; Bg2="#8a1f38"; Accent="#d09a62"},
  @{Slug="sangria"; Label="Sangria"; Family="fruit-wine"; Bg1="#6f1420"; Bg2="#e25a3c"; Accent="#f7c85f"},
  @{Slug="tokaji"; Label="Tokaji"; Family="gold-wine"; Bg1="#9d6818"; Bg2="#f3ce72"; Accent="#fff0b4"},
  @{Slug="vranac"; Label="Vranac"; Family="red-wine"; Bg1="#270918"; Bg2="#6e1733"; Accent="#b76068"},
  @{Slug="wine"; Label="Wine"; Family="wine"; Bg1="#4a1025"; Bg2="#d6a15a"; Accent="#efe2bc"},
  @{Slug="beer"; Label="Beer"; Family="beer"; Bg1="#7a4a10"; Bg2="#f2b84b"; Accent="#fff0a8"},
  @{Slug="kali"; Label="Kali"; Family="malt"; Bg1="#5b3612"; Bg2="#c57b29"; Accent="#f5d08a"},
  @{Slug="kvass"; Label="Kvass"; Family="mug"; Bg1="#4a2b12"; Bg2="#b77735"; Accent="#e1be7c"},
  @{Slug="stout"; Label="Stout"; Family="stout"; Bg1="#120d0b"; Bg2="#4d2f1c"; Accent="#d7b26d"},
  @{Slug="black-tea"; Label="Black tea"; Family="tea"; Bg1="#2c190e"; Bg2="#9b5a27"; Accent="#d8a15d"},
  @{Slug="bosnian-coffee"; Label="Bosnian coffee"; Family="coffee-pot"; Bg1="#4b2f1c"; Bg2="#c6905f"; Accent="#f0d4a8"},
  @{Slug="coffee"; Label="Coffee"; Family="coffee"; Bg1="#3b2317"; Bg2="#b87943"; Accent="#ead1b2"},
  @{Slug="espresso"; Label="Espresso"; Family="espresso"; Bg1="#1f130d"; Bg2="#8d5634"; Accent="#d6b18c"},
  @{Slug="tea"; Label="Tea"; Family="tea"; Bg1="#56652b"; Bg2="#c9a65a"; Accent="#efe0a0"},
  @{Slug="turkish-tea"; Label="Turkish tea"; Family="tulip-tea"; Bg1="#6c1e16"; Bg2="#db7b30"; Accent="#f4c45f"},
  @{Slug="aquavit"; Label="Aquavit"; Family="clear-spirit"; Bg1="#23495a"; Bg2="#9fd5dc"; Accent="#d7f0ee"},
  @{Slug="borovicka"; Label="Borovicka"; Family="juniper"; Bg1="#1e4a39"; Bg2="#78a06b"; Accent="#d8e9ca"},
  @{Slug="brandy"; Label="Brandy"; Family="snifter"; Bg1="#5a2717"; Bg2="#cf7b2d"; Accent="#f3c37e"},
  @{Slug="jenever"; Label="Jenever"; Family="clay-glass"; Bg1="#2f4c47"; Bg2="#a8b58b"; Accent="#e8d7ad"},
  @{Slug="ouzo"; Label="Ouzo"; Family="anise"; Bg1="#1f4d72"; Bg2="#a8d6e8"; Accent="#f5f7f0"},
  @{Slug="raki"; Label="Raki"; Family="anise"; Bg1="#2c5064"; Bg2="#d7e8ea"; Accent="#ffffff"},
  @{Slug="rakia"; Label="Rakia"; Family="fruit-spirit"; Bg1="#734017"; Bg2="#e0a44e"; Accent="#f6d98c"},
  @{Slug="rakija"; Label="Rakija"; Family="fruit-spirit"; Bg1="#6f341e"; Bg2="#d27d44"; Accent="#f4c98d"},
  @{Slug="riga-black-balsam"; Label="Riga Black Balsam"; Family="liqueur"; Bg1="#15100f"; Bg2="#5b3a25"; Accent="#d9a95d"},
  @{Slug="slivovitz"; Label="Slivovitz"; Family="plum"; Bg1="#3a1c4d"; Bg2="#925fa8"; Accent="#d7b6e4"},
  @{Slug="tuica"; Label="Tuica"; Family="plum"; Bg1="#5d2c2c"; Bg2="#d9966a"; Accent="#efd09d"},
  @{Slug="vodka"; Label="Vodka"; Family="clear-spirit"; Bg1="#1c3c53"; Bg2="#b8d7ed"; Accent="#eef8ff"},
  @{Slug="kinnie"; Label="Kinnie"; Family="citrus"; Bg1="#7d3514"; Bg2="#f2993b"; Accent="#ffd95a"},
  @{Slug="skyr-drink"; Label="Skyr drink"; Family="dairy"; Bg1="#6f87a8"; Bg2="#e9f0f5"; Accent="#d95d6a"},
  @{Slug="uzvar"; Label="Uzvar"; Family="dried-fruit"; Bg1="#5a2718"; Bg2="#c87538"; Accent="#f1c067"}
)

function New-Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush (New-Color $hex)
}

function New-RoundedPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = [Math]::Max(1, $r * 2)
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect($g, $brush, $x, $y, $w, $h, $r) {
  $path = New-RoundedPath $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundedRect($g, $pen, $x, $y, $w, $h, $r) {
  $path = New-RoundedPath $x $y $w $h $r
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function Draw-Bottle($g, $x, $y, $w, $h, $color, $accent) {
  $brush = New-Brush $color
  $pen = New-Object System.Drawing.Pen (New-Color $accent), 4
  $g.FillRectangle($brush, $x + $w * .36, $y, $w * .28, $h * .30)
  Fill-RoundedRect $g $brush ($x + $w * .17) ($y + $h * .24) ($w * .66) ($h * .72) 18
  Draw-RoundedRect $g $pen ($x + $w * .17) ($y + $h * .24) ($w * .66) ($h * .72) 18
  $brush.Dispose()
  $pen.Dispose()
}

function Draw-Glass($g, $x, $y, $w, $h, $liquid, $accent, $shape) {
  $glassPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 255, 255, 255)), 4
  $liquidBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(205, (New-Color $liquid)))
  if ($shape -eq "flute") {
    $points = @(
      [System.Drawing.PointF]::new($x + $w*.22, $y),
      [System.Drawing.PointF]::new($x + $w*.78, $y),
      [System.Drawing.PointF]::new($x + $w*.58, $y + $h*.72),
      [System.Drawing.PointF]::new($x + $w*.42, $y + $h*.72)
    )
    $g.DrawPolygon($glassPen, $points)
    $g.FillRectangle($liquidBrush, $x + $w*.30, $y + $h*.36, $w*.40, $h*.28)
    $g.DrawLine($glassPen, $x + $w*.50, $y + $h*.72, $x + $w*.50, $y + $h*.94)
    $g.DrawLine($glassPen, $x + $w*.28, $y + $h*.94, $x + $w*.72, $y + $h*.94)
  } elseif ($shape -eq "snifter") {
    $g.DrawEllipse($glassPen, $x + $w*.12, $y, $w*.76, $h*.58)
    $g.FillPie($liquidBrush, $x + $w*.16, $y + $h*.24, $w*.68, $h*.40, 0, 180)
    $g.DrawLine($glassPen, $x + $w*.50, $y + $h*.58, $x + $w*.50, $y + $h*.92)
    $g.DrawLine($glassPen, $x + $w*.28, $y + $h*.92, $x + $w*.72, $y + $h*.92)
  } else {
    Draw-RoundedRect $g $glassPen ($x + $w*.18) $y ($w*.64) ($h*.82) 16
    Fill-RoundedRect $g $liquidBrush ($x + $w*.22) ($y + $h*.36) ($w*.56) ($h*.42) 12
  }
  $glassPen.Dispose()
  $liquidBrush.Dispose()
}

function Draw-Cup($g, $x, $y, $w, $h, $cup, $liquid) {
  $cupBrush = New-Brush $cup
  $liqBrush = New-Brush $liquid
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 255, 255, 255)), 4
  Fill-RoundedRect $g $cupBrush $x ($y + $h*.22) ($w*.72) ($h*.46) 14
  Draw-RoundedRect $g $pen $x ($y + $h*.22) ($w*.72) ($h*.46) 14
  $g.FillEllipse($liqBrush, $x + $w*.05, $y + $h*.26, $w*.62, $h*.12)
  $g.DrawArc($pen, $x + $w*.58, $y + $h*.30, $w*.32, $h*.28, -80, 220)
  $g.FillEllipse($cupBrush, $x + $w*.08, $y + $h*.70, $w*.82, $h*.10)
  $cupBrush.Dispose()
  $liqBrush.Dispose()
  $pen.Dispose()
}

function Draw-Fruit($g, $x, $y, $r, $color, $accent) {
  $brush = New-Brush $color
  $pen = New-Object System.Drawing.Pen (New-Color $accent), 4
  $g.FillEllipse($brush, $x, $y, $r, $r)
  $g.DrawArc($pen, $x + $r*.16, $y + $r*.10, $r*.62, $r*.70, 110, 130)
  $brush.Dispose()
  $pen.Dispose()
}

function Draw-Scene($drink, $path, $width, $height) {
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $rect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (New-Color $drink.Bg1), (New-Color $drink.Bg2), 25
  $g.FillRectangle($bg, $rect)

  $overlay = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(42, 255, 255, 255))
  for ($i = 0; $i -lt 7; $i++) {
    $g.FillEllipse($overlay, -40 + ($i * $width / 5), 20 + (($i % 3) * $height / 5), $width*.34, $height*.34)
  }
  $overlay.Dispose()

  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(55, 0, 0, 0))
  $g.FillEllipse($shadow, $width*.25, $height*.78, $width*.52, $height*.10)
  $shadow.Dispose()

  switch ($drink.Family) {
    "sparkling" {
      Draw-Glass $g ($width*.22) ($height*.18) ($width*.24) ($height*.64) "#f8df83" $drink.Accent "flute"
      Draw-Bottle $g ($width*.50) ($height*.12) ($width*.24) ($height*.72) "#1f593f" $drink.Accent
      for ($i = 0; $i -lt 9; $i++) { Draw-Fruit $g ($width*(.18 + $i*.055)) ($height*(.64 - ($i%2)*.05)) ($width*.035) "#fff5b8" "#ffffff" }
    }
    "dessert-wine" {
      Draw-Glass $g ($width*.20) ($height*.22) ($width*.30) ($height*.55) "#8e3e1f" $drink.Accent "snifter"
      Draw-Bottle $g ($width*.54) ($height*.18) ($width*.22) ($height*.68) "#3d160f" $drink.Accent
      Draw-Fruit $g ($width*.14) ($height*.66) ($width*.10) "#ce8b35" $drink.Accent
    }
    "red-wine" {
      Draw-Glass $g ($width*.18) ($height*.12) ($width*.32) ($height*.72) "#6b102a" $drink.Accent "snifter"
      Draw-Bottle $g ($width*.56) ($height*.14) ($width*.22) ($height*.70) "#2a1018" $drink.Accent
    }
    "fruit-wine" {
      Draw-Glass $g ($width*.20) ($height*.20) ($width*.30) ($height*.58) "#b91f35" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.54) ($height*.50) ($width*.13) "#f06424" "#ffe1a0"
      Draw-Fruit $g ($width*.65) ($height*.44) ($width*.11) "#e5ba38" "#fff0a8"
      Draw-Fruit $g ($width*.58) ($height*.64) ($width*.10) "#7c1430" "#d78091"
    }
    "gold-wine" {
      Draw-Glass $g ($width*.20) ($height*.16) ($width*.30) ($height*.66) "#d99b21" $drink.Accent "snifter"
      Draw-Bottle $g ($width*.56) ($height*.16) ($width*.22) ($height*.68) "#6b4713" $drink.Accent
    }
    "wine" {
      Draw-Glass $g ($width*.16) ($height*.13) ($width*.28) ($height*.70) "#6b102a" $drink.Accent "snifter"
      Draw-Glass $g ($width*.44) ($height*.16) ($width*.28) ($height*.66) "#f0d574" $drink.Accent "snifter"
      Draw-Bottle $g ($width*.70) ($height*.18) ($width*.16) ($height*.64) "#244d31" $drink.Accent
    }
    "beer" {
      Draw-Glass $g ($width*.22) ($height*.13) ($width*.30) ($height*.70) "#d8891d" $drink.Accent "tumbler"
      Draw-Bottle $g ($width*.58) ($height*.16) ($width*.20) ($height*.68) "#5a3413" $drink.Accent
    }
    "malt" {
      Draw-Glass $g ($width*.20) ($height*.16) ($width*.28) ($height*.66) "#965a20" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.56) ($height*.58) ($width*.15) "#a96b2a" "#f3d28b"
      Draw-Fruit $g ($width*.66) ($height*.50) ($width*.11) "#7c4d23" "#dfb16f"
    }
    "mug" {
      Draw-Glass $g ($width*.22) ($height*.16) ($width*.36) ($height*.62) "#8a4d1e" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.62) ($height*.58) ($width*.13) "#c79045" "#efd08a"
    }
    "stout" {
      Draw-Glass $g ($width*.22) ($height*.10) ($width*.34) ($height*.74) "#1c100b" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.62) ($height*.60) ($width*.13) "#3a2419" "#d7b26d"
    }
    "tea" {
      Draw-Cup $g ($width*.20) ($height*.24) ($width*.42) ($height*.54) "#f2eee4" "#693516"
      Draw-Fruit $g ($width*.62) ($height*.60) ($width*.12) "#a16b29" "#e3bd76"
    }
    "coffee" {
      Draw-Cup $g ($width*.22) ($height*.25) ($width*.44) ($height*.52) "#f4eee5" "#4b2717"
      Draw-Fruit $g ($width*.62) ($height*.62) ($width*.10) "#6b3c21" "#c99b73"
    }
    "coffee-pot" {
      Draw-Cup $g ($width*.18) ($height*.38) ($width*.35) ($height*.40) "#e7d0a9" "#2d1810"
      Draw-Bottle $g ($width*.52) ($height*.20) ($width*.24) ($height*.58) "#9a6a3d" $drink.Accent
    }
    "espresso" {
      Draw-Cup $g ($width*.30) ($height*.32) ($width*.38) ($height*.44) "#ffffff" "#1f120c"
      Draw-Fruit $g ($width*.22) ($height*.64) ($width*.09) "#5a3422" "#d8b08d"
    }
    "tulip-tea" {
      Draw-Glass $g ($width*.28) ($height*.16) ($width*.26) ($height*.68) "#b43f1e" $drink.Accent "flute"
      Draw-Cup $g ($width*.58) ($height*.45) ($width*.26) ($height*.30) "#f3f0e4" "#7e2f18"
    }
    "clear-spirit" {
      Draw-Bottle $g ($width*.24) ($height*.12) ($width*.26) ($height*.72) "#d6f2f8" $drink.Accent
      Draw-Glass $g ($width*.56) ($height*.34) ($width*.22) ($height*.42) "#e9fbff" $drink.Accent "tumbler"
    }
    "juniper" {
      Draw-Bottle $g ($width*.28) ($height*.14) ($width*.24) ($height*.70) "#d9efdb" $drink.Accent
      for ($i = 0; $i -lt 5; $i++) { Draw-Fruit $g ($width*(.56 + ($i%2)*.08)) ($height*(.48 + [Math]::Floor($i/2)*.08)) ($width*.07) "#285d42" "#b9d7c3" }
    }
    "snifter" {
      Draw-Glass $g ($width*.24) ($height*.14) ($width*.34) ($height*.70) "#bf6727" $drink.Accent "snifter"
      Draw-Bottle $g ($width*.62) ($height*.20) ($width*.18) ($height*.62) "#6b2d15" $drink.Accent
    }
    "clay-glass" {
      Draw-Glass $g ($width*.24) ($height*.20) ($width*.32) ($height*.58) "#d9c28c" $drink.Accent "tumbler"
      Draw-Bottle $g ($width*.60) ($height*.18) ($width*.18) ($height*.64) "#38594f" $drink.Accent
    }
    "anise" {
      Draw-Bottle $g ($width*.28) ($height*.14) ($width*.24) ($height*.70) "#e5f4f6" $drink.Accent
      Draw-Glass $g ($width*.58) ($height*.36) ($width*.22) ($height*.40) "#eff9fb" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.15) ($height*.62) ($width*.10) "#f4f1d8" "#ffffff"
    }
    "fruit-spirit" {
      Draw-Glass $g ($width*.22) ($height*.24) ($width*.28) ($height*.54) "#d98a33" $drink.Accent "tumbler"
      Draw-Bottle $g ($width*.58) ($height*.16) ($width*.20) ($height*.66) "#8f4a20" $drink.Accent
      Draw-Fruit $g ($width*.15) ($height*.62) ($width*.11) "#d86b35" "#f6d98c"
    }
    "liqueur" {
      Draw-Bottle $g ($width*.30) ($height*.10) ($width*.28) ($height*.76) "#17120f" $drink.Accent
      Draw-Glass $g ($width*.62) ($height*.42) ($width*.20) ($height*.34) "#2a1710" $drink.Accent "tumbler"
    }
    "plum" {
      Draw-Glass $g ($width*.24) ($height*.24) ($width*.28) ($height*.54) "#d18a4a" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.58) ($height*.55) ($width*.13) "#4b225a" "#d7b6e4"
      Draw-Fruit $g ($width*.66) ($height*.48) ($width*.11) "#6e3b7f" "#d7b6e4"
    }
    "citrus" {
      Draw-Bottle $g ($width*.24) ($height*.16) ($width*.24) ($height*.68) "#cf5c1f" $drink.Accent
      Draw-Fruit $g ($width*.56) ($height*.52) ($width*.16) "#f08a23" "#ffd95a"
      Draw-Fruit $g ($width*.68) ($height*.60) ($width*.10) "#f3ca3f" "#fff2a6"
    }
    "dairy" {
      Draw-Bottle $g ($width*.28) ($height*.14) ($width*.26) ($height*.70) "#eff6fb" $drink.Accent
      Draw-Fruit $g ($width*.60) ($height*.54) ($width*.12) "#d95d6a" "#ffc4ce"
      Draw-Fruit $g ($width*.68) ($height*.62) ($width*.08) "#6c78ad" "#c4cbed"
    }
    "dried-fruit" {
      Draw-Glass $g ($width*.24) ($height*.20) ($width*.30) ($height*.58) "#9f4f24" $drink.Accent "tumbler"
      Draw-Fruit $g ($width*.58) ($height*.52) ($width*.12) "#8d3a24" "#e2a464"
      Draw-Fruit $g ($width*.67) ($height*.60) ($width*.10) "#c27a36" "#f1c067"
    }
  }

  $fontSize = [Math]::Max(18, [Math]::Round($width / 13))
  $font = New-Object System.Drawing.Font "Arial", $fontSize, ([System.Drawing.FontStyle]::Bold)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$AssetsIcons = Join-Path $Root 'assets\icons'

function Get-RelativeAssetPath {
  param(
    [Parameter(Mandatory = $true)][string]$FromFile
  )

  $fromDir = Split-Path -Parent (Resolve-Path $FromFile).Path
  $fromUri = New-Object System.Uri (($fromDir.TrimEnd('\') + '\'))
  $toUri = New-Object System.Uri (($AssetsIcons.TrimEnd('\') + '\'))
  $relative = [System.Uri]::UnescapeDataString($fromUri.MakeRelativeUri($toUri).ToString()).TrimEnd('/')
  return ($relative -replace '\\', '/')
}

function New-MissingIconLines {
  param(
    [Parameter(Mandatory = $true)][string]$Html,
    [Parameter(Mandatory = $true)][string]$IconBase
  )

  $lines = New-Object System.Collections.Generic.List[string]
  if ($Html -notmatch '<link\s+rel=["''](?:shortcut\s+)?icon["''][^>]*favicon\.ico') {
    $lines.Add("  <link rel=""icon"" href=""$IconBase/favicon.ico"" sizes=""any"">")
  }
  if ($Html -notmatch '<link\s+rel=["'']icon["''][^>]*one-sliders-icon\.svg') {
    $lines.Add("  <link rel=""icon"" href=""$IconBase/one-sliders-icon.svg"" type=""image/svg+xml"">")
  }
  if ($Html -notmatch '<link\s+rel=["'']apple-touch-icon["'']') {
    $lines.Add("  <link rel=""apple-touch-icon"" href=""$IconBase/apple-touch-icon.png"">")
  }
  if ($Html -notmatch '<link\s+rel=["'']manifest["'']') {
    $lines.Add("  <link rel=""manifest"" href=""$IconBase/site.webmanifest"">")
  }
  return $lines
}

$updated = 0
$files = & rg --files -g '*.html'

foreach ($relativeFile in $files) {
  $file = Join-Path $Root $relativeFile
  $html = Get-Content -LiteralPath $file -Raw
  $iconBase = Get-RelativeAssetPath -FromFile $file
  $missingLines = New-MissingIconLines -Html $html -IconBase $iconBase
  if ($missingLines.Count -eq 0) {
    continue
  }

  $insert = ($missingLines -join "`r`n") + "`r`n"
  $next = $html
  $existingIconMatches = [regex]::Matches($html, '(?m)^[ \t]*<link\s+rel=["''](?:shortcut\s+)?icon["''][^>]*>|^[ \t]*<link\s+rel=["'']apple-touch-icon["''][^>]*>|^[ \t]*<link\s+rel=["'']manifest["''][^>]*>')

  if ($existingIconMatches.Count -gt 0) {
    $last = $existingIconMatches[$existingIconMatches.Count - 1]
    $position = $last.Index + $last.Length
    $next = $html.Insert($position, "`r`n" + ($missingLines -join "`r`n"))
  } elseif ($html -match '(?m)^[ \t]*<meta\s+name=["'']viewport["''][^>]*>') {
    $match = [regex]::Match($html, '(?m)^[ \t]*<meta\s+name=["'']viewport["''][^>]*>')
    $position = $match.Index + $match.Length
    $next = $html.Insert($position, "`r`n" + ($missingLines -join "`r`n"))
  } elseif ($html -match '<head[^>]*>') {
    $match = [regex]::Match($html, '<head[^>]*>')
    $position = $match.Index + $match.Length
    $next = $html.Insert($position, "`r`n" + $insert)
  } else {
    Write-Warning "Skipping $relativeFile because no <head> was found."
    continue
  }

  if ($next -ne $html) {
    Set-Content -LiteralPath $file -Value $next -NoNewline -Encoding UTF8
    $updated += 1
  }
}

Write-Output "Updated $updated HTML files."

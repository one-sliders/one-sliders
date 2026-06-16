$idxHtml = [System.IO.File]::ReadAllText('content\events\index.html', [System.Text.Encoding]::UTF8)

# Find all cards with formula or motorsport in topic
$cards = [regex]::Matches($idxHtml, 'data-cat="([^"]*)" data-topic="([^"]*)"[^>]*href="([^"]*grand-prix[^"]*|[^"]*formula[^"]*|[^"]*motor[^"]*)"')
foreach ($c in $cards) {
  Write-Host $c.Groups[3].Value + '  cat=' + $c.Groups[1].Value + ' topic=' + $c.Groups[2].Value
}

Write-Host ""
Write-Host "All unique topics in index:"
$allTopics = [regex]::Matches($idxHtml, 'data-topic="([^"]+)"')
$seen = @{}
foreach ($t in $allTopics) {
  $v = $t.Groups[1].Value
  if (-not $seen.ContainsKey($v)) { $seen[$v] = 1; Write-Host "  $v" }
}

$ErrorActionPreference = 'Stop'

$old = '.calendar-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.calendar-actions a{display:block;padding:13px 15px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;background:white;text-decoration:none;font-weight:800;box-shadow:0 6px 16px rgba(0,0,0,.08)}.calendar-actions a:first-child{background:var(--theme);border-color:var(--theme);border-left-color:var(--accent);color:white}.calendar-actions a:first-child::before{content:"+";display:inline-grid;place-items:center;width:22px;height:22px;margin-right:8px;border-radius:999px;background:rgba(255,255,255,.2);font-weight:900}.calendar-actions a:first-child span{color:rgba(255,255,255,.86)}.calendar-actions span{display:block;margin-top:5px;color:var(--muted);font-size:12px;font-weight:600}'
$new = '.calendar-actions{position:fixed;top:54px;right:clamp(12px,2vw,26px);z-index:5;display:flex;gap:6px;align-items:center;padding:6px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 8px 22px rgba(0,0,0,.12);backdrop-filter:blur(8px)}.calendar-actions::before{content:"Calendar";padding:0 7px;color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase}.calendar-actions a{display:inline-flex;align-items:center;min-height:28px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:white;text-decoration:none;font-size:12px;font-weight:800;box-shadow:none}.calendar-actions a:first-child{background:var(--theme);border-color:var(--theme);color:white}.calendar-actions a span{display:none}@media(max-width:700px){.calendar-actions{position:static;margin:0 0 8px;justify-content:flex-start;overflow-x:auto;border-radius:8px}.calendar-actions::before{content:"Calendar"}}'

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $html = [IO.File]::ReadAllText($file.FullName)
  $next = $html.Replace($old, $new)
  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"compact_calendar_menus_updated=$updated"

$ErrorActionPreference = 'Stop'

$oldCss = '.calendar-actions{position:fixed;top:8px;right:clamp(12px,2vw,26px);z-index:50;display:flex;gap:6px;align-items:center;padding:6px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 8px 22px rgba(0,0,0,.18);backdrop-filter:blur(8px)}.calendar-actions::before{content:"Calendar";padding:0 7px;color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase}.calendar-actions a{display:inline-flex;align-items:center;min-height:28px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:white;text-decoration:none;font-size:12px;font-weight:800;box-shadow:none}.calendar-actions a:first-child{background:var(--theme);border-color:var(--theme);color:white}.calendar-actions a span{display:none}@media(max-width:700px){.calendar-actions{position:static;margin:0 0 8px;justify-content:flex-start;overflow-x:auto;border-radius:8px}.calendar-actions::before{content:"Calendar"}}'
$newCss = '.calendar-actions{position:fixed;top:8px;right:clamp(12px,2vw,26px);z-index:50}.calendar-actions summary{list-style:none;display:inline-grid;place-items:center;width:38px;height:38px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.95);box-shadow:0 8px 22px rgba(0,0,0,.18);backdrop-filter:blur(8px);cursor:pointer;color:var(--ink)}.calendar-actions summary::-webkit-details-marker{display:none}.calendar-actions summary svg{width:18px;height:18px}.calendar-actions[open] summary{background:var(--theme);border-color:var(--theme);color:white}.calendar-menu{position:absolute;right:0;top:46px;display:grid;gap:6px;min-width:190px;padding:8px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.97);box-shadow:0 12px 28px rgba(0,0,0,.16);backdrop-filter:blur(8px)}.calendar-menu a{display:block;padding:8px 10px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:800}.calendar-menu a:hover{background:var(--paper)}.calendar-menu span{display:block;margin-top:2px;color:var(--muted);font-size:11px;font-weight:600}@media(max-width:700px){.calendar-actions{top:7px;right:8px}.calendar-menu{right:0;max-width:calc(100vw - 16px)}}'

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $html = [IO.File]::ReadAllText($file.FullName)
  $next = $html.Replace($oldCss, $newCss)
  $next = [regex]::Replace(
    $next,
    '<div class="calendar-actions">([\s\S]*?)</div><div class="date-note">',
    '<details class="calendar-actions"><summary title="Save or share event" aria-label="Save or share event"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg></summary><div class="calendar-menu">$1</div></details><div class="date-note">'
  )
  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"calendar_icon_popovers_updated=$updated"

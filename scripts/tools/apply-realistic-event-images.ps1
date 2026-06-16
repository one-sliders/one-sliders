$ErrorActionPreference = 'Stop'

$queries = @{
  'fifa-world-cup-2026' = 'world cup football stadium fans north america'
  'us-open-tennis' = 'tennis stadium night new york'
  'las-vegas-grand-prix' = 'formula 1 street race las vegas night'
  'mexico-city-grand-prix' = 'formula 1 race track mexico city'
  'united-states-grand-prix' = 'formula 1 circuit of the americas austin'
  'canada-grand-prix' = 'formula 1 montreal circuit race'
  'day-of-the-dead' = 'day of the dead mexico city parade'
  'calgary-stampede' = 'calgary stampede rodeo arena'
  'burning-man' = 'burning man desert art festival'
  'new-york-city-marathon' = 'new york city marathon runners'
  'wimbledon' = 'wimbledon grass tennis court'
  'tour-de-france' = 'tour de france peloton mountains'
  'oktoberfest' = 'oktoberfest munich beer tent'
  'champions-league-final' = 'football final stadium budapest night'
  'eurovision-song-contest' = 'eurovision stage lights arena'
  'monaco-grand-prix' = 'monaco grand prix formula 1 street race'
  'commonwealth-games' = 'glasgow athletics stadium commonwealth games'
  'cannes-film-festival' = 'cannes film festival red carpet'
  'venice-film-festival' = 'venice film festival red carpet lido'
  'british-grand-prix' = 'silverstone formula 1 british grand prix'
  'asian-games-2026' = 'asian games stadium japan athletes'
  'singapore-grand-prix' = 'singapore formula 1 night race'
  'hajj-2026' = 'hajj pilgrimage mecca kaaba'
  'diwali-2026' = 'diwali lights india festival'
  'abu-dhabi-grand-prix' = 'abu dhabi formula 1 yas marina'
  'qatar-grand-prix' = 'qatar formula 1 lusail circuit'
  'yi-peng-and-loy-krathong' = 'chiang mai lantern festival loy krathong'
  'bali-arts-festival' = 'bali traditional dance festival'
  'motogp-japan' = 'motogp motorcycle race japan circuit'
  'seoul-lantern-festival' = 'seoul lantern festival night lights'
  'copa-libertadores-final' = 'south american football final stadium fans'
  'sao-paulo-grand-prix' = 'interlagos formula 1 sao paulo'
  'festa-junina' = 'festa junina brazil festival flags food'
  'inti-raymi' = 'inti raymi cusco peru festival'
  'buenos-aires-tango-festival' = 'buenos aires tango dancers stage'
  'medellin-flower-festival' = 'medellin flower festival parade'
  'oktoberfest-blumenau' = 'blumenau oktoberfest brazil beer festival'
  'brazil-independence-day' = 'brazil independence day parade brasilia'
  'chile-independence-day-and-fiestas-patrias' = 'chile fiestas patrias cueca festival'
  'new-years-eve-copacabana' = 'copacabana new years eve fireworks rio'
  'vivid-sydney' = 'vivid sydney light festival opera house'
  'melbourne-cup' = 'melbourne cup horse racing crowd'
  'sydney-new-years-eve' = 'sydney harbour new years eve fireworks'
  'afl-grand-final' = 'australian football mcg grand final crowd'
  'nrl-grand-final' = 'rugby league grand final stadium sydney'
  'state-of-origin' = 'state of origin rugby league stadium'
  'queenstown-winter-festival' = 'queenstown winter festival ski mountains'
  'bledisloe-cup' = 'rugby union stadium all blacks wallabies'
  'sydney-marathon' = 'sydney marathon runners harbour'
  'fiji-day' = 'fiji day celebration flags suva'
  'great-migration' = 'great migration wildebeest mara river safari'
  'marrakech-international-film-festival' = 'marrakech film festival red carpet'
  'fes-festival-of-world-sacred-music' = 'fes morocco music festival stage'
  'durban-july' = 'durban july horse racing fashion'
  'cape-town-marathon' = 'cape town marathon runners table mountain'
  'hermanus-whale-festival' = 'hermanus whale watching festival coast'
  'cairo-international-film-festival' = 'cairo film festival red carpet'
  'lake-of-stars-festival' = 'lake malawi music festival beach stage'
  'kwita-izina' = 'rwanda gorilla naming ceremony volcanoes'
  'calabar-carnival' = 'calabar carnival nigeria parade costumes'
}

function PhotoUrl([string]$query) {
  'https://source.unsplash.com/1600x1000/?' + [uri]::EscapeDataString($query)
}

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $slug = $file.BaseName
  if (-not $queries.ContainsKey($slug)) { continue }

  $html = [IO.File]::ReadAllText($file.FullName)
  $photo = PhotoUrl $queries[$slug]
  $next = [regex]::Replace(
    $html,
    "background:linear-gradient\((?<gradient>[^;]+?)\),url\(['""][^'""]+\.svg['""]\) center/cover",
    "background:linear-gradient(`${gradient}),url('$photo') center/cover"
  )

  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"realistic_event_images_updated=$updated"

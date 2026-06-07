# add-reach-filter.ps1
# Adds data-reach attributes to all event cards + Reach filter row + location-aware JS

$file = "C:\Users\AndersEriksson\3DF\OneSlider\content\events\index.html"
$html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# --- 1. Define reach per event href ---
$reach = @{
  # Global
  'masters-tournament'              = 'global'
  'roland-garros'                   = 'global'
  'pga-championship'                = 'global'
  'canada-grand-prix'               = 'global'
  'cannes-film-festival'            = 'global'
  'champions-league-final'          = 'global'
  'eurovision-song-contest'         = 'global'
  'hajj-2026'                       = 'global'
  'fifa-world-cup-2026'             = 'global'
  'oslo-ladies-open'                = 'national'
  'wimbledon'                       = 'global'
  'monaco-grand-prix'               = 'global'
  'le-mans-24-hours'                = 'global'
  'us-open-golf'                    = 'global'
  'bali-arts-festival'              = 'national'
  'festa-junina'                    = 'national'
  'inti-raymi'                      = 'continent'
  'tomorrowland'                    = 'global'
  'the-open-championship'           = 'global'
  'british-grand-prix'              = 'global'
  'tour-de-france'                  = 'global'
  'gamescom'                        = 'global'
  'us-open-tennis'                  = 'global'
  'burning-man'                     = 'global'
  'buenos-aires-tango-festival'     = 'continent'
  'medellin-flower-festival'        = 'national'
  'sydney-marathon'                 = 'continent'
  'berlin-marathon'                 = 'global'
  'oktoberfest'                     = 'global'
  'venice-film-festival'            = 'global'
  'world-series-2026'               = 'continent'
  'cape-town-marathon'              = 'continent'
  'day-of-the-dead'                 = 'continent'
  'diwali-2026'                     = 'global'
  'mexico-city-grand-prix'          = 'global'
  'singapore-grand-prix'            = 'global'
  'united-states-grand-prix'        = 'global'
  'oktoberfest-blumenau'            = 'continent'
  'copa-libertadores-final'         = 'continent'
  'las-vegas-grand-prix'            = 'global'
  'new-york-city-marathon'          = 'global'
  'sao-paulo-grand-prix'            = 'global'
  'qatar-grand-prix'                = 'global'
  'marrakech-international-film-festival' = 'continent'
  'cairo-international-film-festival'     = 'continent'
  'melbourne-cup'                   = 'continent'
  'abu-dhabi-grand-prix'            = 'global'
  'calabar-carnival'                = 'national'
  'jul-i-vinterland'                = 'national'
  'new-years-eve-copacabana'        = 'global'
  'sydney-new-years-eve'            = 'global'
  'summer-olympics-2028'            = 'global'
  'winter-olympics-2030'            = 'global'
  'copa-america-2028'               = 'global'
  'uefa-euro-2028'                  = 'global'
  'glastonbury-2027'                = 'global'
  'fifa-womens-world-cup-2027'      = 'global'
  'africa-cup-of-nations-2027'      = 'continent'
  'ces-2027'                        = 'global'
  'australian-open-2027'            = 'global'
  'afc-asian-cup-2027'              = 'continent'
  'ryder-cup-2027'                  = 'global'
  'grammy-awards-2027'              = 'global'
  'six-nations-2027'                = 'continent'
  'coachella-2027'                  = 'global'
  'london-marathon-2027'            = 'global'
  'boston-marathon-2027'            = 'global'
  'dubai-world-cup-2027'            = 'continent'
  'ultra-music-festival-2027'       = 'global'
  'oscars-2027'                     = 'global'
  'met-gala-2027'                   = 'global'
  'rugby-world-cup-2027'            = 'global'
  'cricket-world-cup-2027'          = 'global'
  'super-bowl-lx'                   = 'global'
  'icc-t20-world-cup-2026'          = 'global'
  # Continent
  'indianapolis-500'                = 'continent'
  'ipl-final-2026'                  = 'continent'
  'stanley-cup-final-2026'          = 'continent'
  'nba-finals-2026'                 = 'continent'
  'commonwealth-games'              = 'continent'
  'bledisloe-cup'                   = 'continent'
  'afl-grand-final'                 = 'national'
  'asian-games-2026'                = 'continent'
  'nrl-grand-final'                 = 'national'
  'comic-con-international-2026'    = 'continent'
  'great-migration'                 = 'global'
  'durban-july'                     = 'national'
  'hermanus-whale-festival'         = 'national'
  'kwita-izina'                     = 'national'
  'lake-of-stars-festival'          = 'continent'
  'motogp-japan'                    = 'global'
  'fes-festival-of-world-sacred-music' = 'continent'
  'brazil-independence-day'         = 'national'
  'chile-independence-day-and-fiestas-patrias' = 'national'
  'seoul-lantern-festival'          = 'national'
  'yi-peng-and-loy-krathong'        = 'national'
  'fiji-day'                        = 'national'
  # National
  'state-of-origin'                 = 'national'
  'vivid-sydney'                    = 'national'
  'norwegian-constitution-day'           = 'national'
  'oya-festival'                    = 'national'
  'calgary-stampede'                = 'national'
  'queenstown-winter-festival'      = 'national'
}

# --- 2. Inject data-reach into each event card ---
$count = 0
foreach ($slug in $reach.Keys) {
  $r = $reach[$slug]
  # Match event-card anchor that contains this slug in href, add data-reach if not already present
  $pattern = '(<a class="event-card"(?![^>]*data-reach)[^>]*href="[^"]*' + [regex]::Escape($slug) + '[^"]*")'
  $replacement = '$1 data-reach="' + $r + '"'
  $before = $html
  $html = [regex]::Replace($html, $pattern, $replacement)
  if ($html -ne $before) { $count++ }
}
Write-Host "data-reach added to $count cards"

# --- 3. Add Reach filter row after the country-row closing div ---
$reachRow = '
    <!-- Row 5: Reach -->
    <div class="filter-row" id="reach-row">
      <span class="filter-label">Reach</span>
      <button class="filter-btn active" data-reach="relevant">&#128205; Relevant to me</button>
      <button class="filter-btn" data-reach="global">&#127758; Global</button>
      <button class="filter-btn" data-reach="continent">&#127757; Continent</button>
      <button class="filter-btn" data-reach="national">&#127987; National</button>
      <button class="filter-btn" data-reach="all">All</button>
    </div>

    </div><!-- /.filter-rows -->'

$html = $html -replace '    </div><!-- /\.filter-rows -->', $reachRow

# --- 4. Add reach filter variable to JS state ---
$html = $html -replace "let activeCat = 'all', activeTopic = 'all', activeCont = 'all', activeCountry = 'all';",
  "let activeCat = 'all', activeTopic = 'all', activeCont = 'all', activeCountry = 'all', activeReach = 'relevant';
    let userCountry = '', userContinent = ''; // set by IP lookup"

# --- 5. Extend matches() to include reach ---
$oldMatches = "      return isCurrentOrUpcoming(card)
          && (cat     === 'all' || card.dataset.cat     === cat)
          && (topic   === 'all' || card.dataset.topic   === topic)
          && (cont    === 'all' || card.dataset.cont    === cont)
          && (country === 'all' || card.dataset.country === country);"

$newMatches = "      const reach = overrides.reach !== undefined ? overrides.reach : activeReach;
      const cardReach = card.dataset.reach || 'global';
      const reachOk = reach === 'all'
        || (reach === 'global'    && cardReach === 'global')
        || (reach === 'continent' && cardReach === 'continent')
        || (reach === 'national'  && cardReach === 'national')
        || (reach === 'relevant'  && (
              cardReach === 'global'
              || (cardReach === 'continent' && (!userContinent || card.dataset.cont === userContinent))
              || (cardReach === 'national'  && (!userCountry  || card.dataset.country === userCountry))
           ));
      return isCurrentOrUpcoming(card)
          && reachOk
          && (cat     === 'all' || card.dataset.cat     === cat)
          && (topic   === 'all' || card.dataset.topic   === topic)
          && (cont    === 'all' || card.dataset.cont    === cont)
          && (country === 'all' || card.dataset.country === country);"

$html = $html -replace [regex]::Escape($oldMatches), $newMatches

# --- 6. Add reach filter button wiring after existing filter JS ---
$reachJS = @'

    // Reach filter
    document.querySelectorAll('[data-reach]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-reach]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeReach = btn.dataset.reach;
        applyFilters();
      });
    });

    // IP-based location detection (ipapi.co, no permission required)
    const contMap = { EU:'europe', NA:'north-america', AS:'asia', OC:'oceania', SA:'south-america', AF:'africa' };
    function applyLocation(country, continent) {
      userCountry = (country || '').toLowerCase().replace(/\s+/g,'-');
      userContinent = contMap[continent] || '';
      localStorage.setItem('os_country', userCountry);
      localStorage.setItem('os_continent', userContinent);
      localStorage.setItem('os_geo_ts', Date.now());
      if (activeReach === 'relevant') applyFilters();
    }
    const cached = localStorage.getItem('os_country');
    const ts = parseInt(localStorage.getItem('os_geo_ts') || '0');
    if (cached && (Date.now() - ts < 86400000)) {
      userCountry = cached;
      userContinent = localStorage.getItem('os_continent') || '';
      if (activeReach === 'relevant') applyFilters();
    } else {
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(d => applyLocation(d.country_code, d.continent_code))
        .catch(() => {}); // fall back silently - show all if fetch fails
    }
'@

$html = $html -replace '  </script>', $reachJS + "`n  </script>"

[System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
Write-Host "Done. Reach filter added."

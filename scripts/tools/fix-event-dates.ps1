# fix-event-dates.ps1
# Adds data-start + fixes vague card-meta dates on events/index.html

$file = "C:\Users\AndersEriksson\3DF\OneSlider\content\events\index.html"
$html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# --- Lookup: href-slug -> [data-start, display date text] ---
$events = @{
  # April 2026
  'masters-tournament'                    = @('2026-04-09', '9-12 Apr 2026')
  # May 2026
  'pga-championship'                      = @('2026-05-14', '14-17 May 2026')
  'norwegian-constitution-day'                 = @('2026-05-17', '17 May 2026')
  'cannes-film-festival'                  = @('2026-05-13', '13-23 May 2026')
  'eurovision-song-contest'               = @('2026-05-12', '12-16 May 2026')
  'canada-grand-prix'                     = @('2026-05-22', '22-24 May 2026')
  'indianapolis-500'                      = @('2026-05-24', '24 May 2026')
  'ipl-final-2026'                        = @('2026-05-24', '24 May 2026')
  'roland-garros-2026'                    = @('2026-05-24', '24 May - 7 Jun 2026')
  'vivid-sydney'                          = @('2026-05-23', '23 May - 13 Jun 2026')
  'champions-league-final'               = @('2026-05-30', '30 May 2026')
  'fes-festival-of-world-sacred-music'   = @('2026-05-22', '22-30 May 2026')
  'hajj-2026'                             = @('2026-06-17', '17-22 Jun 2026')
  'state-of-origin'                       = @('2026-05-06', '6 May - 8 Jul 2026')
  # June 2026
  'monaco-grand-prix'                     = @('2026-06-04', '4-7 Jun 2026')
  'le-mans-24-hours'                      = @('2026-06-13', '13-14 Jun 2026')
  'oslo-ladies-open'                      = @('2026-06-12', '12-15 Jun 2026')
  'nba-finals-2026'                       = @('2026-06-04', '4-21 Jun 2026')
  'stanley-cup-final-2026'               = @('2026-06-01', '1-30 Jun 2026')
  'us-open-golf'                          = @('2026-06-18', '18-21 Jun 2026')
  'fifa-world-cup-2026'                   = @('2026-06-11', '11 Jun - 19 Jul 2026')
  'bali-arts-festival'                    = @('2026-06-13', '13 Jun - 11 Jul 2026')
  'festa-junina'                          = @('2026-06-01', 'Jun 2026')
  'inti-raymi'                            = @('2026-06-24', '24 Jun 2026')
  'queenstown-winter-festival'           = @('2026-06-11', '11-21 Jun 2026')
  'wimbledon'                             = @('2026-06-29', '29 Jun - 12 Jul 2026')
  # July 2026
  'british-grand-prix'                    = @('2026-07-03', '3-5 Jul 2026')
  'calgary-stampede'                      = @('2026-07-03', '3-12 Jul 2026')
  'comic-con-international-2026'         = @('2026-07-23', '23-26 Jul 2026')
  'commonwealth-games'                    = @('2026-07-16', '16 Jul - 2 Aug 2026')
  'durban-july'                           = @('2026-07-04', '4 Jul 2026')
  'great-migration'                       = @('2026-07-01', 'Jul - Oct 2026')
  'tomorrowland-2026'                     = @('2026-07-17', '17-26 Jul 2026')
  'the-open-championship'                = @('2026-07-16', '16-19 Jul 2026')
  'tour-de-france'                        = @('2026-06-27', '27 Jun - 26 Jul 2026')
  # August 2026
  'bledisloe-cup'                         = @('2026-08-08', '8 Aug - 26 Sep 2026')
  'buenos-aires-tango-festival'          = @('2026-08-12', '12-30 Aug 2026')
  'burning-man'                           = @('2026-08-30', '30 Aug - 7 Sep 2026')
  'gamescom-2026'                         = @('2026-08-26', '26-30 Aug 2026')
  'medellin-flower-festival'             = @('2026-08-01', '1-16 Aug 2026')
  'oya-festival'                          = @('2026-08-12', '12-15 Aug 2026')
  'sydney-marathon'                       = @('2026-08-16', '16 Aug 2026')
  'us-open-tennis'                        = @('2026-08-24', '24 Aug - 13 Sep 2026')
  # September 2026
  'afl-grand-final'                       = @('2026-09-26', '26 Sep 2026')
  'asian-games-2026'                      = @('2026-09-19', '19 Sep - 4 Oct 2026')
  'berlin-marathon-2026'                 = @('2026-09-27', '27 Sep 2026')
  'brazil-independence-day'              = @('2026-09-07', '7 Sep 2026')
  'chile-independence-day-and-fiestas-patrias' = @('2026-09-18', '18-19 Sep 2026')
  'hermanus-whale-festival'              = @('2026-09-25', '25-27 Sep 2026')
  'kwita-izina'                           = @('2026-09-05', 'Sep 2026')
  'lake-of-stars-festival'               = @('2026-09-25', '25-27 Sep 2026')
  'motogp-japan'                          = @('2026-09-25', '25-27 Sep 2026')
  'oktoberfest'                           = @('2026-09-19', '19 Sep - 4 Oct 2026')
  'venice-film-festival'                 = @('2026-08-27', '27 Aug - 12 Sep 2026')
  # October 2026
  'cape-town-marathon'                    = @('2026-10-18', '18 Oct 2026')
  'day-of-the-dead'                       = @('2026-11-01', '1-2 Nov 2026')
  'diwali-2026'                           = @('2026-10-20', '20 Oct 2026')
  'fiji-day'                              = @('2026-10-10', '10 Oct 2026')
  'mexico-city-grand-prix'               = @('2026-10-30', '30 Oct - 1 Nov 2026')
  'nrl-grand-final'                       = @('2026-10-04', '4 Oct 2026')
  'oktoberfest-blumenau'                 = @('2026-10-10', '10-25 Oct 2026')
  'singapore-grand-prix'                 = @('2026-10-09', '9-11 Oct 2026')
  'united-states-grand-prix'             = @('2026-10-23', '23-25 Oct 2026')
  'world-series-2026'                    = @('2026-10-23', '23 Oct - 1 Nov 2026')
  # November 2026
  'abu-dhabi-grand-prix'                 = @('2026-12-04', '4-6 Dec 2026')
  'cairo-international-film-festival'    = @('2026-11-04', '4-20 Nov 2026')
  'calabar-carnival'                      = @('2026-12-01', '1-31 Dec 2026')
  'copa-libertadores-final'              = @('2026-11-28', '28 Nov 2026')
  'las-vegas-grand-prix'                 = @('2026-11-19', '19-21 Nov 2026')
  'marrakech-international-film-festival'= @('2026-11-21', '21 Nov - 5 Dec 2026')
  'melbourne-cup'                         = @('2026-11-03', '3 Nov 2026')
  'new-york-city-marathon'               = @('2026-11-01', '1 Nov 2026')
  'qatar-grand-prix'                      = @('2026-11-27', '27-29 Nov 2026')
  'sao-paulo-grand-prix'                 = @('2026-11-06', '6-8 Nov 2026')
  'seoul-lantern-festival'               = @('2026-11-07', '7-22 Nov 2026')
  'yi-peng-and-loy-krathong'             = @('2026-11-20', '20-24 Nov 2026')
  # December 2026
  'jul-i-vinterland'                      = @('2026-12-01', '1-24 Dec 2026')
  'new-years-eve-copacabana'             = @('2026-12-31', '31 Dec 2026')
  'sydney-new-years-eve'                 = @('2026-12-31', '31 Dec 2026')
  # 2027+
  'ces-2027'                              = @('2027-01-05', '5-8 Jan 2027')
  'australian-open-2027'                 = @('2027-01-18', '18-31 Jan 2027')
  'afc-asian-cup-2027'                   = @('2027-01-07', '7 Jan - 5 Feb 2027')
  'grammy-awards-2027'                   = @('2027-02-01', 'Feb 2027')
  'six-nations-2027'                      = @('2027-02-06', '6 Feb - 20 Mar 2027')
  'glastonbury-2027'                      = @('2027-06-23', '23-27 Jun 2027')
  'fifa-womens-world-cup-2027'           = @('2027-06-24', '24 Jun - 25 Jul 2027')
  'africa-cup-of-nations-2027'           = @('2027-06-01', '1 Jun - 31 Jul 2027')
  'ryder-cup-2027'                        = @('2027-09-17', '17-19 Sep 2027')
  'coachella-2027'                        = @('2027-04-11', 'Apr 2027')
  'london-marathon-2027'                 = @('2027-04-27', 'Apr 2027')
  'boston-marathon-2027'                 = @('2027-04-19', 'Apr 2027')
  'dubai-world-cup-2027'                 = @('2027-03-27', 'Mar 2027')
  'ultra-music-festival-2027'            = @('2027-03-26', 'Mar 2027')
  'oscars-2027'                           = @('2027-03-28', 'Mar 2027')
  'met-gala-2027'                         = @('2027-05-03', 'May 2027')
  'rugby-world-cup-2027'                 = @('2027-10-01', '1 Oct - 13 Nov 2027')
  'cricket-world-cup-2027'               = @('2027-10-01', '1 Oct - 30 Nov 2027')
  'super-bowl-lx'                         = @('2026-02-08', '8 Feb 2026')
  'icc-t20-world-cup-2026'               = @('2026-02-07', '7 Feb - 8 Mar 2026')
  'copa-america-2028'                     = @('2028-06-01', '1 Jun - 31 Jul 2028')
  'uefa-euro-2028'                        = @('2028-06-09', '9 Jun - 9 Jul 2028')
  'summer-olympics-2028'                 = @('2028-07-14', '14-30 Jul 2028')
  'winter-olympics-2030'                 = @('2030-02-01', '1-17 Feb 2030')
}

$count = 0
foreach ($slug in $events.Keys) {
  $start   = $events[$slug][0]
  $display = $events[$slug][1]

  # Add data-start if not already present (match href containing slug)
  $pattern = '(<a class="event-card"(?![^>]*data-start)[^>]*href="[^"]*' + [regex]::Escape($slug) + '[^"]*")'
  $before = $html
  $html = [regex]::Replace($html, $pattern, "`$1 data-start=""$start""")
  if ($html -ne $before) { $count++ }

  # Fix card-meta date text â€” replace only vague dates (no 4-digit year in them)
  # Pattern: card containing this slug, then card-meta with vague date
  $metaPattern = '(href="[^"]*' + [regex]::Escape($slug) + '[^"]*"[^<]*(?:<[^>]+>[^<]*)*?<span class="card-meta">)[^<]+(</span>)'
  $html = [regex]::Replace($html, $metaPattern, {
    param($m)
    $existing = [regex]::Match($m.Value, '<span class="card-meta">([^<]+)</span>').Groups[1].Value
    # Only replace if date portion looks vague (no 4-digit year)
    if ($existing -notmatch '\d{4}') {
      $loc = [regex]::Match($existing, ' Â· (.+)$').Groups[1].Value
      $m.Value -replace '<span class="card-meta">[^<]+</span>', "<span class=""card-meta"">$display Â· $loc</span>"
    } else {
      $m.Value
    }
  })
}

Write-Host "data-start added to $count cards"
[System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
Write-Host "Done."

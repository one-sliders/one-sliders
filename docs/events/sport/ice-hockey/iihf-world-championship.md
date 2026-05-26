# IIHF World Championship

- Register slug: iihf-world-championship
- Event page EN: en/content/categories/sport/ice-hockey/events/iihf-world-championship.html
- Current edition: 2026
- Status: active (group stage ongoing)
- Update mode: standings
- Last checked: 23 May 2026

## Sources

- [IIHF 2026 tournament hub](https://www.iihf.com/en/events/2026/wm)
- [IIHF 2026 official schedule and results](https://www.iihf.com/en/events/2026/wm/schedule)
- [IIHF 2026 results and schedule](https://stats.iihf.com/Hydra/969/index.html)
- [Olympics.com: All scores, standings and schedule](https://www.olympics.com/en/news/mens-2026-iihf-ice-hockey-world-championship-all-scores-group-standings-game-schedule)
- [Bleacher Report: Updated standings after May 22](https://bleacherreport.com/articles/25430315-updated-hockey-world-championship-2026-results-group-standings-ahead-ko-bracket-after-may-22)

## AI Update Instructions

Use this workflow when updating `en/content/categories/sport/ice-hockey/events/iihf-world-championship-live.json`.

### Completed match results

Go directly to the IIHF official result page for the 2026 IIHF Ice Hockey World Championship:

https://www.iihf.com/en/events/2026/wm/schedule

Fetch all played matches in the tournament, not only one group. Include only matches that have a final result. If the page separates matches by group or phase, combine all completed matches into one list. Sort with the latest played match first.

When preparing or checking the update, answer in Swedish as a table with these columns:

| Datum | Grupp/fas | Match | Resultat | Kommentar |
|---|---|---|---|---|

In `Kommentar`, note if the match was decided after overtime, shootout, or another special condition. Put the exact source URL below the table.

Map the table into the JSON `parts.groups.blocks[0].groupPanels[].completedMatches` arrays:

- `date`: short display date, for example `23 May`
- `home`: country object with matching `name`, `url`, and `flag`
- `score`: final score, including `OT` or `SO` when applicable
- `away`: country object with matching `name`, `url`, and `flag`

Keep newest completed matches first in the rendered page. The shared JavaScript reverses older chronological arrays, so if editing manually, verify the browser output after saving.

### Upcoming fixtures

Use the same IIHF schedule page for upcoming fixtures. Put future Group A / Group B games in `parts.groups.blocks[0].groupPanels[].upcomingMatches`. Keep `id` values stable:

- `group-a`
- `group-b`

For each fixture, update `dateLabel`, `time`, `group`, `venue`, `home`, and `away`. Move a game from `upcomingMatches` into the same group's `completedMatches` once it has a final result.

### Standings

Update `standingsLabel` and `standingsDetail` for Group A and Group B after all completed games for a day are entered. Keep country links and flags paired exactly with the visible country names. Update the note text to the latest verified date.

## Latest Verified Status

- Group stage runs 15â€“26 May; playoffs 28â€“31 May; gold medal game 31 May
- Event page updated through the early 23 May games: Latvia 4-2 United States, Switzerland 9-0 Hungary, Denmark 4-0 Slovenia, Slovakia 2-3 Czechia

### May 22 results

- Germany 6â€“2 Hungary (Germany's first win of the tournament)
- Canada 3â€“1 Slovenia
- Finland 4â€“0 Great Britain
- Sweden 3â€“0 Italy

### Group A standings (after 22 May games)

1. Switzerland â€” 5 GP, +21 GD, 15 pts
2. Finland â€” 5 GP, +19 GD, 15 pts
3. Austria â€” 4 GP, -2 GD, 9 pts
4. United States â€” 5 GP, -1 GD, 5 pts
5. Germany â€” 5 GP, -6 GD, 4 pts
6. Hungary â€” 4 GP, -4 GD, 3 pts
7. Latvia â€” 4 GP, -8 GD, 3 pts
8. United Kingdom â€” 5 GP, -19 GD, 0 pts

### Group B standings (after 22 May games)

1. Canada â€” 5 GP, +15 GD, 14 pts
2. Slovakia â€” 5 GP, +9 GD, 11 pts
3. Czechia â€” 5 GP, +5 GD, 10 pts
4. Sweden â€” 5 GP, +10 GD, 9 pts
5. Norway â€” 5 GP, +6 GD, 7 pts
6. Slovenia â€” 5 GP, -12 GD, 3 pts
7. Denmark â€” 4 GP, -15 GD, 0 pts
8. Italy â€” 5 GP, -18 GD, 0 pts

## Stages Update Plan

- Add 4 May 22 match results to the results block (newest first)
- Update Group A standings table (Switzerland and Finland now both on 15 pts; Germany up to 4 pts)
- Update Group B standings table (Canada 14 pts, Slovakia 11 pts, Czechia 10 pts, Sweden 9 pts)
- Update match-note to reflect "updated after all 22 May games"
- 23 May games not yet available; keep as scheduled


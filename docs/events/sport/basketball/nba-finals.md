# NBA Finals

- Register slug: nba-finals
- Event page EN: en/content/categories/sport/basketball/events/nba-finals.html
- Current edition: 2026
- Status: active (playoffs ongoing; Finals not started)
- Update mode: standings
- Last checked: 22 May 2026

## Sources

- [NBA.com: 2026 NBA Play-in Tournament, Playoffs & Finals Schedule](https://www.nba.com/news/2026-nba-playoffs-schedule)
- [NBA.com: 2026 NBA Finals Schedule](https://www.nba.com/news/2026-nba-finals-schedule)
- [NBA.com: 2026 NBA Playoffs official hub](https://www.nba.com/playoffs/2026)

## Latest Verified Status

- NBA Finals 2026 are scheduled for 3-19 June 2026.
- All NBA Finals games are scheduled for 8:30 p.m. ET on ABC.
- Finals teams are not confirmed yet.
- Eastern Conference Final: New York Knicks lead Cleveland Cavaliers 2-0 after wins of 115-104 (OT) and 109-93.
- Western Conference Final: San Antonio Spurs and Oklahoma City Thunder are tied 1-1 after Spurs 122-115 (2OT) and Thunder 122-113.
- Next listed game on the NBA schedule: Oklahoma City at San Antonio, Game 3, 22 May 2026 at 8:30 ET on NBC/Peacock.
- East Game 3 is New York at Cleveland on 23 May 2026 at 8 ET on ESPN.

## Page Structure Recommendation

Use the same structure as the hockey event pages for this level.

### Final series

- Default part.
- The actual NBA Finals best-of-seven series.
- Show all seven game slots with official dates.
- Keep teams as `East champion` and `West champion` until confirmed.
- Show series standing as 0-0 / pending.
- Once the Finals start, replace dates and TBC rows with official scores only.

### Playoff path

- Shows the route into the Finals.
- Keep Conference Finals as the current live context until finalists are confirmed.
- Show East and West series standings, next games and recent results.
- Once finalists are known, preserve the conference-final outcome and move the live focus to `Final series`.

## Current Page Implementation Notes

- `event-part-data.defaultPart` should be `final-series`.
- `event-part-data.parts` should be exactly:
  - `final-series`
  - `playoff-path`
- The `final-series` part should include:
  - `How this stage works`
  - `All game results`
  - `Series standing`
- The `playoff-path` part should include:
  - `Conference Finals now`
  - `Path to the Finals`
  - `Trophy outcome`
- Use `part-card--results` and `part-card--standings` like the hockey pages.
- Do not add generic `Tracker / Schedule / Results` tabs for this page.

## No Update / Safety Notes

- Do not invent finalists before the Conference Finals are complete.
- Do not mark a Finals venue until the teams and home-court order are confirmed.
- Do not invent ticket prices or availability.
- Use NBA.com schedule and official recap pages for scores.

# NBA Finals live JSON update guide

Live data file: en\content\categories\sport\basketball\events\nba-finals-live.json
Event page: $(System.Collections.Hashtable.Path)
Last reviewed: 2026-05-23

## What belongs in JSON

Update the JSON file when the current edition changes. Keep the HTML page stable unless the structure, images or evergreen description changes.

Use these blocks for user-facing information:

- Live status: date, place and whether the event is upcoming, underway or complete.
- What to update: the most useful schedule/result/programme detail for this event.
- Update source: official source link.
- Add extra blocks for confirmed results, standings, leaderboards, daily programmes or visual summaries when they exist.

## Official source

Go directly to: https://www.nba.com/schedule

Collect confirmed data for: Series score, game schedule, completed results and leading scorers.

## Visual guidance

Use best-of-seven series bars and game result table.

Use tables, score cards, progress bars, country flags and compact visual summaries where they help a human scan the page. Do not add private/internal notes or unverified commentary to the visible page.


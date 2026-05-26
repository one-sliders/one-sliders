# Indianapolis 500 live JSON update guide

Live data file: en\content\categories\sport\motorsport\events\indianapolis-500-live.json
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

Go directly to: https://www.indianapolismotorspeedway.com/events/indy500

Collect confirmed data for: Starting grid, race status, winner, caution count and top finishers.

## Visual guidance

Use grid cards, lap-progress meter and driver/team table.

Use tables, score cards, progress bars, country flags and compact visual summaries where they help a human scan the page. Do not add private/internal notes or unverified commentary to the visible page.


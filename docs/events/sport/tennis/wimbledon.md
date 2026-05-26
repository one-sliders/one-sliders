# Wimbledon live JSON update guide

Live data file: en\content\categories\sport\tennis\events\wimbledon-live.json
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

Go directly to: https://www.wimbledon.com/en_GB/scores/index.html

Collect confirmed data for: Order of play, completed matches, draw progress and daily session notes.

## Visual guidance

Use draw tables, court schedule cards and country flags for players when verified.

Use tables, score cards, progress bars, country flags and compact visual summaries where they help a human scan the page. Do not add private/internal notes or unverified commentary to the visible page.


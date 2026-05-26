# Venice Film Festival

- Register slug: venice-film-festival
- Event page EN: en/content/categories/culture/film/events/venice-film-festival.html
- Current edition: 2026 (83rd)
- Status: upcoming
- Update mode: event-update
- Last checked: 22 May 2026

## Sources

- [La Biennale: Save The Dates 2026](https://www.labiennale.org/en/news/save-dates-2026)
- [La Biennale Cinema 2026: Information](https://www.labiennale.org/en/cinema/2026/information)
- [La Biennale: Maggie Gyllenhaal President of the Venezia 83 international jury](https://www.labiennale.org/en/news/maggie-gyllenhaal-president-venezia-83-international-jury)
- [La Biennale Cinema 2026: Regulations](https://www.labiennale.org/en/cinema/2026/regulations)
- [La Biennale Cinema 2026: Venice Production Bridge](https://www.labiennale.org/en/cinema/2026/venice-production-bridge)

## Latest Verified Status

- The 83rd Venice International Film Festival runs 2-12 September 2026.
- The festival takes place on the Lido di Venezia.
- Maggie Gyllenhaal is president of the Venezia 83 international jury.
- The complete 2026 line-up is scheduled to be announced at the end of July 2026 during the official press conference.
- Tickets and subscriptions are not yet on sale; the official information page says they will be available soon.
- The official selection sections are Venezia 83, Open - Out of Competition, Orizzonti, Venice Spotlight, Venice Classics, Venice Immersive, and Biennale College Cinema.
- Venice Production Bridge runs alongside the festival as the industry/project market.
- Final Cut in Venice is scheduled for 6-8 September 2026 during Venice Production Bridge.
- Closing night is 12 September 2026, when the Venezia 83 jury awards the Golden Lion and other official prizes.

## People, Films And Names To Surface

### Confirmed people

- Maggie Gyllenhaal - president of the Venezia 83 international jury; country: USA.
- Alberto Barbera - Director of the Venice Film Festival; country: Italy.

### Programme and film status

- Competition line-up: TBC until the official end-of-July press conference.
- Opening film: TBC.
- Red-carpet actors / celebrities: TBC; add only when source-backed.
- Official sections to surface: Venezia 83, Open - Out of Competition, Orizzonti, Venice Spotlight, Venice Classics, Venice Immersive, Biennale College Cinema.

## Stages Update Plan

- Use the same reference pattern as Cannes at this level.
- Do not split the page into Opening / Main programme / Closing unless there is live daily data.
- Use two parts only:
  - `Festival now` - people, programme status, sections, Lido access and industry-market context.
  - `Awards` - official prize list before the ceremony, then actual winners after 12 September 2026.
- Do not invent 2026 films, actors, celebrity guests or award winners before official confirmation.

### Festival now

- Default part.
- Title should be similar to: "Venice 2026: people, sections and Lido guide".
- Show three equal-width cards across the row:
  - `Confirmed people` table.
  - `Programme status` table.
  - `Lido / industry` table.
- Each row should use:
  - name/item
  - role/status
  - country rendered as flag + name + link where a country applies
  - why it matters

### Awards

- Separate part.
- Same visual style as `Festival now`.
- Before winners are announced:
  - show the official prize categories and status as pending.
  - show jury president and closing-night date.
- After winners are announced:
  - replace pending rows with actual winners.
  - show prize, film/person, country with flag + name + link, and official status.

## Current Page Implementation Notes

- `event-part-data.defaultPart` should be `festival-now`.
- `event-part-data.parts` should be exactly:
  - `festival-now`
  - `awards`
- `festival-now.blocks` should use three `part-card--third` cards so they fill the full row.
- `awards.blocks` should also use `part-card--third` cards.
- Use `.people-table` / `.people-row` for these tables.
- Countries must use the normal country chip pattern with flag + name + link.
- Update the 2026 year data to 2-12 September 2026.

## No Update / Safety Notes

- Line-up is not announced yet; keep film rows as TBC until the official press conference.
- Tickets are not yet on sale; do not add prices until the official ticket page publishes them.
- Do not claim a celebrity is attending unless a current source says so.
- Do not invent award winners before the 12 September 2026 closing ceremony.

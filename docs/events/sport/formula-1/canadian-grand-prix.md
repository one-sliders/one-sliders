# Canadian Grand Prix

- Register slug: canadian-grand-prix
- Event page EN: en/content/categories/sport/formula-1/events/canadian-grand-prix.html
- Live data EN: en/content/categories/sport/formula-1/events/canadian-grand-prix-live.json
- Current edition: 2026
- Status: active (sprint format weekend, race day)
- Update mode: live JSON
- Last checked: 24 May 2026

## Sources

- [Formula 1 official: Canadian Grand Prix 2026](https://www.formula1.com/en/racing/2026/canada)
- [Formula 1 official: Sprint results](https://www.formula1.com/en/results/2026/races/1285/canada/sprint-results)
- [Formula 1 official: Sprint grid](https://www.formula1.com/en/results/2026/races/1285/canada/sprint-grid)
- [Formula 1: Sprint Qualifying report](https://www.formula1.com/en/latest/article/russell-grabs-pole-position-in-canada-sprint-qualifying-ahead-of-antonelli-and-norris.7Fm9bjk84nwzOysiMriBCs)
- [Formula 1: FP1 report](https://www.formula1.com/en/latest/article/fp1-antonelli-leads-russell-as-mercedes-dominate-disrupted-canadian-gp-practice-session.52B0jh2hwB6deh2lcWmGt5)

## AI Update Instructions

Use this workflow when updating `en/content/categories/sport/formula-1/events/canadian-grand-prix-live.json`.

Go directly to Formula 1's official Canadian Grand Prix event page and results pages:

https://www.formula1.com/en/racing/2026/canada

Check the official result pages for these sessions as they become available:

- Practice 1
- Sprint Qualifying / Sprint Grid
- Sprint
- Qualifying / Starting Grid
- Race Result
- Fastest Laps if relevant

Update only the JSON file unless the page structure itself changes. The HTML page loads `canadian-grand-prix-live.json` through `externalBlocksSrc`.

### Weekend sessions

Update `parts.weekend-sessions.blocks` with:

- A weekend tracker block showing completed and upcoming sessions
- A latest completed sessions table
- A Sprint classification table while the Sprint is the latest race result
- Sprint grid / qualifying information until the Grand Prix starting grid replaces it

Keep newest completed information first. Mark sessions as `Complete` only when Formula 1 has posted an official result page or event-page result.

### Race view

Update `parts.race.blocks` after Qualifying and Race:

- Starting grid / pole position after official Qualifying or Starting Grid
- Grand Prix classification after official Race Result
- Championship implications after points are confirmed

If a session is not official yet, keep `TBC` or `Pending`; do not infer from live timing.

### Swedish checking table

When preparing an update, summarize the official source data in Swedish with:

| Datum | Session | Toppresultat | Status | Kommentar |
|---|---|---|---|---|

Put exact source URLs under the table.

## Latest Verified Status

- Sprint format weekend, Circuit Gilles Villeneuve, Montreal
- Schedule from official Formula 1 event page:
  - Fri 22 May: Practice 1 complete; Sprint Qualifying complete
  - Sat 23 May: Sprint complete; Qualifying pending
  - Sun 24 May: Canadian Grand Prix pending

### Practice 1 (Fri 22 May) - Completed

- Kimi Antonelli (Mercedes) led the session
- George Russell (Mercedes) also prominent
- Session faced disruptions; Formula 1 reported Albon damage after a groundhog collision

### Sprint Qualifying (Fri 22 May) - Completed

Full top 10 grid for Sprint Race:

1. George Russell (Mercedes) - 1:12.965
2. Kimi Antonelli (Mercedes) - 1:13.033
3. Lando Norris (McLaren) - 1:13.280
4. Oscar Piastri (McLaren) - 1:13.299
5. Lewis Hamilton (Ferrari) - 1:13.326
6. Charles Leclerc (Ferrari) - 1:13.410
7. Max Verstappen (Red Bull Racing) - 1:13.504
8. Isack Hadjar (Red Bull Racing) - 1:13.605
9. Arvid Lindblad (Racing Bulls) - 1:13.737
10. Carlos Sainz (Williams) - 1:14.536

### F1 Sprint (Sat 23 May) - Completed

Points finishers:

1. George Russell (Mercedes) - 28:50.951 - 8 pts
2. Lando Norris (McLaren) - +1.272s - 7 pts
3. Kimi Antonelli (Mercedes) - +1.843s - 6 pts
4. Oscar Piastri (McLaren) - +9.797s - 5 pts
5. Charles Leclerc (Ferrari) - +9.929s - 4 pts
6. Lewis Hamilton (Ferrari) - +10.545s - 3 pts
7. Max Verstappen (Red Bull Racing) - +15.935s - 2 pts
8. Arvid Lindblad (Racing Bulls) - +29.710s - 1 pt

### Qualifying (Sat 23 May) - Pending

### Canadian Grand Prix (Sun 24 May) - Pending

## Stages Update Plan

- Update JSON after official Qualifying result posts
- Replace Sprint Grid block with Grand Prix Starting Grid once official
- Update Race block after official classification posts
- Keep static HTML unchanged unless the layout needs a structural change


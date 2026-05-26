---
name: oneslider-routine-update-active-event-stages
description: Scheduled routine for updating Stages/Parts sections for currently active OneSliders events using events.register.json and each event notes MD as the working brief.
---

# Routine: Update Stages For Active Events

## Goal

For every event currently marked active in `events.register.json`, update the event page's Stages/Parts section from the event's related Markdown notes file and verified real-world sources.

This routine is for maintenance only. It must not redesign pages, regenerate images, edit unrelated fields, or update non-active events.

## Pre-Approval

This is a scheduled autonomous routine. The agent has pre-approval to perform the actions below without pausing:

- Read `events.register.json`.
- Read and update files referenced by each active record's `notesFile`.
- Search the web for official/current event status.
- Edit only the Stages/Parts data in files referenced by `eventPageEN`.
- Run validation commands.
- Run `git status`, `git add`, `git commit`, and `git push` on the current branch.

Stop and report only if a hard rule below would be violated.

## Source Of Truth

Use `events.register.json` as the event index.

For each event record:

- `status` identifies whether the event is active.
- `eventPageEN` points to the English event page to update.
- `notesFile` points to the Markdown working file for research notes, source tracking, and intended Stages structure.
- `updateMode` tells what kind of Stages update is expected, such as `standings`, `series-results`, `match-results`, `classification-results`, or `event-update`.
- `sources` contains preferred official or strong sources.
- `lastChecked` tells when the event was last reviewed.

If `events.register.json` and an event page disagree, trust the event page data for page-specific fields, but report the mismatch in the final summary.

## Active Event Selection

1. Read `events.register.json`.
2. Select records where `status` is `active`.
3. For each active record, verify that `eventPageEN` exists.
4. Verify that `notesFile` exists.
5. If a `notesFile` does not exist, create it before researching. The file must be concise and contain:
   - event title
   - current edition
   - update mode
   - event page path
   - known dates/location
   - source URLs
   - latest verified status notes
   - intended Stages/Parts update summary

## Research Workflow

This routine is meant to run **often** (several times a day while an
event is active), so it must anchor to the real current date and go
after *today's* live data — never just copy a source's last daily
summary.

For each active event:

1. **Establish "now".** Determine today's date (and rough time for
   events with several daily sessions). This is the truth — not any
   "as of <date>" line printed in a source.
2. Read the event's `notesFile` and the current Stages/Parts data from
   `eventPageEN` / its live data file.
3. **Compare today's date to the fixture list.** List every fixture,
   session, race or stage scheduled for today, plus anything on/before
   today still marked upcoming/pending. Those are the slots that may
   now have a result.
4. **Search specifically for today's played results**, not a generic
   recap:
   - `[event title] [currentEdition] [today's date] results score`
   - `[home] vs [away] [today's date] result` for each of today's fixtures
   - `[event title] [currentEdition] live standings`
   Naming today's date and today's specific fixtures forces fresh data;
   a plain "latest results" query tends to return day-old summaries.
5. **Prefer live-updating sources over dated summaries.** Best to worst:
   official live scoreboard/results page > federation/league live page >
   real-time score aggregator > news recap. If a page says "correct as
   of <date>" and that date is **before today**, treat it as possibly
   stale and cross-check today's fixtures against a live source before
   marking anything pending.
6. Extract only verified facts:
   - results played so far today and earlier (exact scores, OT/SO)
   - current standings or classification
   - series score
   - schedule changes, withdrawals, postponements, venue changes
   - official announcements
7. **Apply results as soon as they are official.** A fixture played
   earlier today gets its score now; do not leave a played fixture
   pending just because a summary source hasn't caught up. Keep a
   fixture pending only if it genuinely has not been played yet or no
   official result exists.
8. Store source URLs in the `notesFile`.
9. If nothing new is verified, write `No verified update found` in the
   notes file and move on.

Never invent facts or infer a score from live timing. If a source is
unclear, omit the claim and keep the fixture pending.

## Markdown Notes Rule

The Markdown notes file is the working brief. The HTML event page should be updated from the notes file, not directly from memory.

Before editing `eventPageEN`, make sure the notes file contains the verified facts that will be applied.

The notes file should stay short and operational, not become a long article.

Suggested notes structure:

```md
# Event Title

- Register slug:
- Event page EN:
- Current edition:
- Status:
- Update mode:
- Last checked:

## Sources

- [Official source](https://...)

## Latest Verified Status

- ...

## Stages Update Plan

- Tracker:
- Schedule:
- Results / standings:

## No Update Notes

- ...
```

## Event Page Update Rules

Update only the Stages/Parts section of `eventPageEN`.

In the current OneSliders event format, that means:

- the JSON script with `id="event-part-data"`
- visible copy inside the `#parts` slide only when necessary for consistency

Do not edit:

- Slide 1 General content
- Slide 2 Year content
- images
- navigation
- unrelated event pages
- unrelated categories
- global CSS/JS unless the routine explicitly fails due to a shared rendering bug

Preserve all still-valid existing entries. Add new verified results/status without deleting valid older context. Remove text only when it is now false, stale, or irrelevant.

Keep wording neutral and factual. No marketing language. No speculation.

## Expected Stages Output

Each active event should end with a Stages/Parts section that reflects current status.

Use the existing sport/event structure:

- `match-results` for completed and upcoming matches/sessions.
- `standings-table` for standings, classification, series status, leaderboard, medal table, or final outcome.
- `match-note` for source/update timestamp or clear pending notes.

Use the event's `updateMode`:

- `standings`: update live standings and recent results.
- `series-results`: update match list, series score, winner status.
- `match-results`: update fixtures/results and final status.
- `classification-results`: update leaderboard/classification/podium/status.
- `event-update`: update schedule/status/announcement notes.

If a result is not yet known, keep it visible as `TBC` or `Pending`; do not hide the part.

## Validation

After updating all active events:

1. Parse `events.register.json`.
2. Parse every edited page's `event-year-data` and `event-part-data` JSON.
3. Confirm every edited event page still contains:
   - `id="event-part-data"`
   - `match-results` where relevant
   - `standings-table` where relevant
4. Run `git diff` and confirm only these changed:
   - active events' `eventPageEN` files
   - active events' `notesFile` files
   - `events.register.json` only if `lastChecked`, source metadata, or active status was intentionally updated

If any unrelated file changed, stop and report. Do not commit.

## Commit And Push

If validation passes:

1. Run `git status`.
2. Stage only the allowed changed files.
3. Commit with:

   `Update stages for active events YYYY-MM-DD`

4. Push to the current branch.
5. Report the commit hash.

## Final Report

Report:

- events updated
- events with no verified new info
- events skipped and why
- mismatches between register and page data
- files changed
- commit hash

## Hard Rules

- Never invent facts.
- Never use unclear or unsourced claims.
- Never update non-active events.
- Never edit outside the Stages/Parts section of event pages.
- Never push if unrelated files changed.
- Never rely on `content/events/this-week.html` over `events.register.json`.
- The event page is updated from the MD notes file plus verified sources, not from memory.

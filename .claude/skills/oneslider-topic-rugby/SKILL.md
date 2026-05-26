---
name: oneslider-topic-rugby
description: Use for OneSlider Rugby event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Rugby - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

The stage section must adapt to the rugby event format. Do not force a tournament bracket onto a representative series, and do not create one tab per match.

Use one of these structures:

1. Match series: events made of several named matches, such as State of Origin.
2. Tournament: events with pool play and knockouts.
3. Single match: a final or showcase match with no separate stages.

## Format A: Match Series

Use this when the event is decided across multiple matches or games.

```
<RESULTS>
  <SERIES MATCHES> -- Tab: Series matches
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] series matches.
      Find every match in the series, match dates, kick-off times, venues, teams, completed scores, upcoming match status, source URL and last updated time.
      Results must be newest completed matches first.
      Keep future matches visible with TBC score placeholders.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <SCHEDULE>
      MATCH 1
      MATCH 2
      MATCH 3, IF PLAYED
      OTHER MATCHES, IF THE EVENT USES THEM
    </SCHEDULE>
    <RESULTS>
      ALL SERIES MATCH RESULTS
      NEWEST COMPLETED MATCHES FIRST
    </RESULTS>
  </SERIES MATCHES>

  <SERIES RESULT> -- Tab: Series result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] series result.
      Find current series score, points for and against, series winner if decided, player of the series if awarded, decisive match, source URL and last updated time.
      If the series is not decided, keep winner fields as TBC.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <STANDINGS>
      SERIES SCORE
      POINTS FOR / AGAINST
      SERIES STATUS
    </STANDINGS>
    <OUTCOME>
      WINNER
      RUNNER-UP
      PLAYER OF THE SERIES, IF AWARDED
      DECISIVE MATCH
    </OUTCOME>
  </SERIES RESULT>
</RESULTS>
```

## Format B: Tournament

Use this when the event has pool play before a final or knockout round.

```
<RESULTS>
  <POOL STAGE> -- Tab: Pool stage
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] pool stage.
      Find latest completed pool matches, pool standings, qualification line, eliminated teams, source URL and last updated time.
      Results must be newest completed matches first.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <RESULTS>
      ALL POOL MATCH RESULTS
      NEWEST COMPLETED MATCHES FIRST
    </RESULTS>
    <STANDINGS>
      ALL POOL STANDINGS
    </STANDINGS>
  </POOL STAGE>

  <KNOCKOUTS> -- Tab: Knockouts
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] knockouts.
      Find current bracket, latest completed knockout matches, upcoming matches, finalists, final result if complete, source URL and last updated time.
      Keep round grouping, but sort matches newest-first inside each round.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <BRACKET>
      KNOCKOUT TREE
    </BRACKET>
    <RESULTS>
      ALL KNOCKOUT MATCH RESULTS, GROUPED BY ROUND
      NEWEST COMPLETED MATCHES FIRST WITHIN EACH ROUND
    </RESULTS>
    <OUTCOME>
      CHAMPION
      RUNNER-UP
      THIRD PLACE ONLY IF AWARDED
    </OUTCOME>
  </KNOCKOUTS>
</RESULTS>
```

## Format C: Single Match

Use this when the page covers one match only.

```
<RESULTS>
  <MATCH> -- Tab: Match
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] match.
      Find teams, venue, kick-off time, match status, lineups if announced, final score if complete, source URL and last updated time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <BUILDUP>
      TEAMS
      FORM
      WHAT TO WATCH
    </BUILDUP>
    <RESULTS>
      FINAL SCORE
      SCORERS / KEY PLAYS
      PLAYER OF THE MATCH, IF AWARDED
    </RESULTS>
  </MATCH>
</RESULTS>
```

## Rules

- For State of Origin, use `Series matches` and `Series result`.
- Do not create one tab per match.
- If the event is not a tournament, do not show `Pool stage` or `Knockouts`.
- If data is not confirmed, write `TBC`; do not invent teams, dates, venues, scores or awards.
- Results must be newest completed matches first.
- Keep future matches visible with scheduled time and `TBC` result/status.
- Keep stage labels user-facing and event-specific.

## Rendering And Update Rules

- Each result block must contain exactly one continuous `<match-results>` wrapper.
- Do not close and reopen `<match-results>` inside the same stage block.
- Newest-first sorting only works reliably inside one continuous `<match-results>` wrapper.
- If a match has not started, keep it visible with `TBC` or `Result pending` placeholders.
- Add a `<match-note>` to every results block with update status.
- Use this update-status pattern:

```
<match-note>
  Updated after [MATCH_NAME]. Next match: [MATCH_NAME] at [TIME].
</match-note>
```

- If no matches have been completed yet, use:

```
<match-note>
  No matches have been completed yet. Newest completed results should appear first once played.
</match-note>
```

## Format Selection Prompt

Before choosing a structure, research `[EVENT_NAME] [YEAR]` and identify the real rugby format:

- Match series
- Tournament with pool stage and knockouts
- Single match
- Other

Then choose the matching XML-like structure above. Do not create stages that `[EVENT_NAME]` does not actually use.

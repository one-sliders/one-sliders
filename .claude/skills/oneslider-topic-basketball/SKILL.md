---
name: oneslider-topic-basketball
description: Use for OneSlider Basketball event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Basketball - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

The stage section must adapt to the basketball event format. Do not split a playoff series into one tab per game. Keep the page focused on the series state and the latest results.

Use one of these structures:

1. Final series: best-of series such as NBA Finals.
2. Tournament: group or league phase followed by knockouts.
3. Single game: one championship game or showcase game.

## Format A: Final Series

Use this when the event is a playoff final or best-of series.

```
<RESULTS>
  <SERIES GAMES> -- Tab: Series games
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] series games.
      Find every game in the series, dates, tip-off times, venues, teams, completed scores, upcoming game status, source URL and last updated time.
      Results must be newest completed games first.
      Keep future games visible with TBC score placeholders.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <SCHEDULE>
      GAME 1
      GAME 2
      GAME 3
      GAME 4
      GAME 5, IF NEEDED
      GAME 6, IF NEEDED
      GAME 7, IF NEEDED
    </SCHEDULE>
    <RESULTS>
      ALL SERIES GAME RESULTS
      NEWEST COMPLETED GAMES FIRST
    </RESULTS>
  </SERIES GAMES>

  <SERIES RESULT> -- Tab: Series result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] series result.
      Find current series score, leading scorers, rebound leaders, assist leaders, champion if decided, MVP if awarded, source URL and last updated time.
      If the series is not decided, keep champion and MVP as TBC.
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
      SERIES STATUS
      POINT DIFFERENTIAL
    </STANDINGS>
    <LEADERS>
      POINTS
      REBOUNDS
      ASSISTS
      OTHER EVENT-RELEVANT LEADERS
    </LEADERS>
    <OUTCOME>
      CHAMPION
      RUNNER-UP
      MVP, IF AWARDED
    </OUTCOME>
  </SERIES RESULT>
</RESULTS>
```

## Format B: Tournament

Use this when the event has group play, a league phase or early rounds before knockouts.

```
<RESULTS>
  <GROUP OR LEAGUE PHASE> -- Tab: Group stage
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] group or league phase.
      Find latest completed games, standings, qualification line, eliminated teams, source URL and last updated time.
      Results must be newest completed games first.
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
      ALL GROUP OR LEAGUE GAME RESULTS
      NEWEST COMPLETED GAMES FIRST
    </RESULTS>
    <STANDINGS>
      ALL STANDINGS
    </STANDINGS>
  </GROUP OR LEAGUE PHASE>

  <KNOCKOUTS> -- Tab: Knockouts
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] knockout stage.
      Find current bracket, latest completed knockout games, upcoming games, finalists, final result if complete, source URL and last updated time.
      Keep round grouping, but sort games newest-first inside each round.
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
      ALL KNOCKOUT GAME RESULTS, GROUPED BY ROUND
      NEWEST COMPLETED GAMES FIRST WITHIN EACH ROUND
    </RESULTS>
    <OUTCOME>
      CHAMPION
      RUNNER-UP
      THIRD PLACE ONLY IF AWARDED
    </OUTCOME>
  </KNOCKOUTS>
</RESULTS>
```

## Format C: Single Game

Use this when the page covers one game only.

```
<RESULTS>
  <GAME> -- Tab: Game
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] game.
      Find teams, venue, tip-off time, game status, starters if announced, final score if complete, key stats, source URL and last updated time.
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
      QUARTER SCORES
      KEY PLAYERS
      MVP, IF AWARDED
    </RESULTS>
  </GAME>
</RESULTS>
```

## Rules

- For NBA Finals, use `Series games` and `Series result`.
- Do not create one tab per game.
- If the event is not a tournament, do not show `Group stage` or `Knockouts`.
- If data is not confirmed, write `TBC`; do not invent teams, dates, venues, scores, leaders or awards.
- Results must be newest completed games first.
- Keep future games visible with scheduled time and `TBC` result/status.
- Keep stage labels user-facing and event-specific.

## Rendering And Update Rules

- Each result block must contain exactly one continuous `<match-results>` wrapper.
- Do not close and reopen `<match-results>` inside the same stage block.
- Newest-first sorting only works reliably inside one continuous `<match-results>` wrapper.
- If a game has not started, keep it visible with `TBC` or `Result pending` placeholders.
- Add a `<match-note>` to every results block with update status.
- Use this update-status pattern:

```
<match-note>
  Updated after [GAME_NAME]. Next game: [GAME_NAME] at [TIME].
</match-note>
```

- If no games have been completed yet, use:

```
<match-note>
  No games have been completed yet. Newest completed results should appear first once played.
</match-note>
```

## Format Selection Prompt

Before choosing a structure, research `[EVENT_NAME] [YEAR]` and identify the real basketball format:

- Final series / playoff final
- Tournament with group or league phase and knockouts
- Single game
- Other

Then choose the matching XML-like structure above. Do not create stages that `[EVENT_NAME]` does not actually use.

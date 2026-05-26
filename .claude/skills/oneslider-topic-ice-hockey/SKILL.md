---
name: oneslider-topic-ice-hockey
description: Use for OneSlider Ice Hockey event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Ice Hockey - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

The stage section must adapt to the event format. Do not force a group-stage tab onto events that do not have group play.

Use one of these two structures:

1. Tournament format: events with group stage + playoffs, such as world championships or Olympic tournaments.
2. Final-series format: events that are only a championship series or final playoff round, such as Stanley Cup Final.

## Format A: Tournament With Group Stage

Use this when the event has pools/groups before knockout rounds.

```
<RESULTS>
  <GROUP STAGE> -- Tab: Group stage
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] group stage.
      Find latest completed group games, current group standings, teams above the qualification line, teams eliminated or at risk, source URL and last updated time.
      Results must be newest completed games first.
      Use TBC for unconfirmed values.
      Render every country as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <RESULTS>
      ALL GROUP GAME RESULTS
      NEWEST COMPLETED GAMES FIRST
    </RESULTS>
    <STANDINGS>
      ALL GROUP STANDINGS
    </STANDINGS>
  </GROUP STAGE>

  <PLAYOFFS> -- Tab: Playoffs
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] playoffs.
      Find current bracket, latest completed knockout games, upcoming knockout games, semi-finalists, finalists, medal-game teams, gold/silver/bronze results if complete, source URL and last updated time.
      Keep round grouping, but sort games newest-first inside each round.
      Do not include a bronze medal game unless [EVENT_NAME] actually plays one.
      Use TBC for unconfirmed values.
      Render every country as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <BRACKET>
      KNOCKOUT TREE (QF -> SF -> FINAL)
    </BRACKET>
    <RESULTS>
      ALL KNOCKOUT GAME RESULTS, GROUPED BY ROUND
        NEWEST COMPLETED GAMES FIRST WITHIN EACH ROUND
        QUARTERFINALS
        SEMIFINALS
        BRONZE MEDAL GAME, IF PLAYED
        FINAL
    </RESULTS>
    <MEDALS>
      GOLD
      SILVER
      BRONZE, IF AWARDED
    </MEDALS>
  </PLAYOFFS>
</RESULTS>
```

## Format B: Final Series / Playoff Final

Use this when the event itself is a final series, not a full tournament page.

Examples:

- Stanley Cup Final
- SHL Final
- Liiga Finals
- Any best-of series where the page covers only the final matchup

```
<RESULTS>
  <FINAL SERIES> -- Tab: Final series
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] final series.
      Find current series score, latest completed game, upcoming game, home/away order, venue for each game, champion if complete, source URL and last updated time.
      Results must be newest completed games first.
      Use TBC for unconfirmed values.
      Render every country/team country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <RESULTS>
      ALL FINAL-SERIES GAME RESULTS
        NEWEST COMPLETED GAMES FIRST
        GAME 1
        GAME 2
        GAME 3
        GAME 4
        GAME 5, IF NEEDED
        GAME 6, IF NEEDED
        GAME 7, IF NEEDED
    </RESULTS>
    <STANDINGS>
      SERIES STANDING
        FINALIST A WINS
        FINALIST B WINS
        SERIES STATUS
    </STANDINGS>
  </FINAL SERIES>

  <PLAYOFF PATH> -- Tab: Playoff path
    <AI_RESEARCH_PROMPT>
      Research how the finalists reached [EVENT_NAME] [YEAR].
      Find the route to final, earlier round results or summaries, semi-final/conference-final results, finalists, champion if complete, source URL and last updated time.
      Keep round grouping, but sort games newest-first inside each round.
      Do not include a bronze or third-place item unless [EVENT_NAME] actually awards it.
      Use TBC for unconfirmed values.
      Render every country/team country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <BRACKET>
      ROUTE TO FINAL
        EARLIER ROUNDS
        SEMIFINAL / CONFERENCE FINAL
        FINAL
    </BRACKET>
    <RESULTS>
      KNOCKOUT RESULTS OR SUMMARY, GROUPED BY ROUND
      NEWEST COMPLETED GAMES FIRST WITHIN EACH ROUND
    </RESULTS>
    <OUTCOME>
      CHAMPION
      RUNNER-UP
      BRONZE / THIRD PLACE ONLY IF THE COMPETITION ACTUALLY AWARDS IT
    </OUTCOME>
  </PLAYOFF PATH>
</RESULTS>
```

## Rules

- Do not show `Group stage` unless the event has an actual group stage.
- Do not show `Bronze medal game` unless that competition actually plays one.
- If the event is a league playoff final, use `Final series` and `Playoff path`.
- If data is not confirmed, write `TBC`; do not invent teams, dates, venues or scores.
- In every results list, show the newest completed result at the top. For grouped playoff results, keep the round grouping, but sort games newest-first inside each round.
- Keep the stage labels user-facing and event-specific. The page title and the tab names must not contradict each other.

## Rendering And Update Rules

- Each result block must contain exactly one continuous `<match-results>` wrapper.
- Do not close and reopen `<match-results>` inside the same stage block.
- Newest-first sorting only works reliably inside one continuous `<match-results>` wrapper.
- If a stage has not started, keep the stage visible with `TBC` placeholders instead of hiding it.
- If knockout matchups are not confirmed, show bracket placeholders such as `QF`, `W(QF)`, `L(SF)` or `TBC`.
- Add a `<match-note>` to every results block with update status.
- Use this update-status pattern:

```
<match-note>
  Updated after all [DATE] games. [NEXT_DATE] games scheduled.
</match-note>
```

- If no games in the stage have been completed yet, use:

```
<match-note>
  No [STAGE_NAME] games have been completed yet. Newest completed results should appear first once played.
</match-note>
```

## Format Selection Prompt

Before choosing a structure, research `[EVENT_NAME] [YEAR]` and identify the real competition format:

- Tournament with group stage and playoffs
- Final series / playoff final
- Single match
- Other

Then choose the matching XML-like structure above. Do not create stages that `[EVENT_NAME]` does not actually use.

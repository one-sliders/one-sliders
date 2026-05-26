---
name: oneslider-topic-formula-1
description: Use for OneSlider Formula 1 event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Formula 1 - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

The stage section must adapt to the Formula 1 weekend format. Do not create separate tabs for every session. A Grand Prix page should stay compact and event-specific.

Use one of these two structures:

1. Standard Grand Prix weekend: practice, qualifying and race.
2. Sprint Grand Prix weekend: practice, sprint qualifying, sprint, qualifying and race.

For both formats, use two tabs:

- `Weekend sessions`
- `Race`

## Format A: Standard Grand Prix Weekend

Use this when the event has practice, qualifying and race, but no sprint.

```
<RESULTS>
  <WEEKEND SESSIONS> -- Tab: Weekend sessions
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] weekend sessions.
      Find practice sessions, qualifying session, session times, session status, latest completed session results, source URL and last updated time.
      Results must be newest completed sessions first.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <SCHEDULE>
      PRACTICE SESSIONS
      QUALIFYING
      RACE
    </SCHEDULE>
    <RESULTS>
      ALL COMPLETED SESSION RESULTS
      NEWEST COMPLETED SESSIONS FIRST
    </RESULTS>
  </WEEKEND SESSIONS>

  <RACE> -- Tab: Race
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race.
      Find starting grid, race status, race classification, podium, fastest lap, retirements, penalties, championship impact, source URL and last updated time.
      If the race has not started, keep the tab visible with TBC placeholders and show the confirmed race time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <GRID>
      STARTING GRID / POLE POSITION
    </GRID>
    <RESULTS>
      RACE CLASSIFICATION
      PODIUM
      FASTEST LAP
      RETIREMENTS / PENALTIES
    </RESULTS>
    <STANDINGS IMPACT>
      DRIVER CHAMPIONSHIP IMPACT
      CONSTRUCTOR CHAMPIONSHIP IMPACT
    </STANDINGS IMPACT>
  </RACE>
</RESULTS>
```

## Format B: Sprint Grand Prix Weekend

Use this when the event has a sprint.

```
<RESULTS>
  <WEEKEND SESSIONS> -- Tab: Weekend sessions
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] sprint weekend sessions.
      Find practice, sprint qualifying, sprint, qualifying, race time, completed session results, upcoming session times, source URL and last updated time.
      Results must be newest completed sessions first.
      Keep scheduled future sessions visible with TBC placeholders.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <SCHEDULE>
      PRACTICE
      SPRINT QUALIFYING
      SPRINT
      QUALIFYING
      RACE
    </SCHEDULE>
    <RESULTS>
      ALL COMPLETED SESSION RESULTS
      NEWEST COMPLETED SESSIONS FIRST
    </RESULTS>
  </WEEKEND SESSIONS>

  <RACE> -- Tab: Race
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race and weekend outcome.
      Find race starting grid, sprint result if complete, qualifying result if complete, race classification, podium, fastest lap, penalties, retirements, championship impact, source URL and last updated time.
      If the race has not started, keep race classification visible with TBC placeholders.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <GRID>
      STARTING GRID / POLE POSITION
    </GRID>
    <RESULTS>
      RACE CLASSIFICATION
      PODIUM
      FASTEST LAP
      PENALTIES / RETIREMENTS
    </RESULTS>
    <STANDINGS IMPACT>
      DRIVER CHAMPIONSHIP IMPACT
      CONSTRUCTOR CHAMPIONSHIP IMPACT
    </STANDINGS IMPACT>
  </RACE>
</RESULTS>
```

## Rules

- Do not create one tab per session.
- Use `Weekend sessions` for practice, sprint qualifying, sprint and qualifying.
- Use `Race` for starting grid, race classification, podium and championship impact.
- If the event is not a sprint weekend, do not show sprint rows.
- If the event is a sprint weekend, keep sprint rows in `Weekend sessions`, not as separate tabs.
- If data is not confirmed, write `TBC`; do not invent drivers, teams, times, penalties or results.
- Results must be newest completed sessions first.
- Keep future sessions visible with scheduled time and `TBC` result/status.
- Keep the stage labels user-facing and event-specific. The page title and tab names must not contradict each other.

## Rendering And Update Rules

- Each result block must contain exactly one continuous `<match-results>` wrapper.
- Do not close and reopen `<match-results>` inside the same stage block.
- Newest-first sorting only works reliably inside one continuous `<match-results>` wrapper.
- If a session or race has not started, keep it visible with `TBC` or `Result pending` placeholders.
- Add a `<match-note>` to every results block with update status.
- Use this update-status pattern:

```
<match-note>
  Updated after [SESSION_NAME]. Next session: [NEXT_SESSION_NAME] at [TIME].
</match-note>
```

- If no sessions have been completed yet, use:

```
<match-note>
  No sessions have been completed yet. Newest completed sessions should appear first once run.
</match-note>
```

## Format Selection Prompt

Before choosing a structure, research `[EVENT_NAME] [YEAR]` and identify the real Formula 1 weekend format:

- Standard Grand Prix weekend
- Sprint Grand Prix weekend
- Cancelled / postponed / incomplete weekend
- Other

Then choose the matching XML-like structure above. Do not create stages that `[EVENT_NAME]` does not actually use.

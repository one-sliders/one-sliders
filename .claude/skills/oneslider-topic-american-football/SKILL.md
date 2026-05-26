---
name: oneslider-topic-american-football
description: Use for OneSlider American Football event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# American Football - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for American football games, bowls, playoff rounds and championships.

## Recommended Structure

```
<RESULTS>
  <GAME> -- Tab: Game
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] game details: teams, venue, kickoff time, broadcast, injury/status notes, source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <BUILDUP>TEAMS FORM KEY MATCHUPS WATCH INFO</BUILDUP>
  </GAME>
  <RESULT> -- Tab: Result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] final score, quarter scores, key plays, MVP, stats leaders, source URL and last updated time.
      If the game has not started, keep result fields as TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>FINAL SCORE QUARTER SCORES KEY PLAYS MVP</RESULTS>
    <STATS>PASSING RUSHING RECEIVING DEFENSE</STATS>
  </RESULT>
</RESULTS>
```

## Rules

- Do not create one tab per quarter.
- Use official league or event sources for scores.
- Keep future games visible with TBC placeholders.

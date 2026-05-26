---
name: oneslider-topic-baseball
description: Use for OneSlider Baseball event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Baseball - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for baseball games, series and tournaments.

## Recommended Structure

```
<RESULTS>
  <SERIES GAMES> -- Tab: Series games
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] games, dates, first pitch times, venues, probable pitchers if official, source URL and last updated time.
      Results must be newest completed games first. Keep future games visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>GAME LIST</SCHEDULE>
    <RESULTS>COMPLETED GAMES NEWEST FIRST</RESULTS>
  </SERIES GAMES>
  <SERIES RESULT> -- Tab: Series result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] series score, champion/winner if complete, MVP if awarded, stat leaders and source URL.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STANDINGS>SERIES SCORE STATUS</STANDINGS>
    <OUTCOME>WINNER RUNNER-UP MVP IF AWARDED</OUTCOME>
  </SERIES RESULT>
</RESULTS>
```

## Rules

- Do not create one tab per inning or game.
- Use official scores and official probable pitchers only.
- Results must be newest completed games first.

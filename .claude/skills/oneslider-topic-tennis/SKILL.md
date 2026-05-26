---
name: oneslider-topic-tennis
description: Use for OneSlider Tennis event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Tennis - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for tennis tournaments, finals and team competitions.

## Recommended Structure

```
<RESULTS>
  <DRAWS> -- Tab: Draws
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] draws, schedule, courts, seeds, latest completed matches, source URL and last updated time.
      Results must be newest completed matches first. Keep future matches visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>MATCH SCHEDULE BY ROUND</SCHEDULE>
    <RESULTS>COMPLETED MATCHES NEWEST FIRST</RESULTS>
  </DRAWS>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, finalists, champions, doubles if relevant, rankings impact and source URL.
      Keep round grouping; sort matches newest-first inside each round. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <BRACKET>DRAW / ROUTE TO FINAL</BRACKET>
    <OUTCOME>CHAMPIONS FINALISTS NOTABLE RESULTS</OUTCOME>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not create one tab per round.
- Results must be newest completed matches first.
- Use official tournament/ATP/WTA/ITF sources.

---
name: oneslider-topic-cycling
description: Use for OneSlider Cycling event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Cycling - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for cycling races, tours, classics and championships.

## Recommended Structure

```
<RESULTS>
  <STAGES> -- Tab: Stages
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] route, stages, dates, start/finish cities, profiles, teams/riders, source URL and last updated time.
      Results must be newest completed stages first. Keep future stages visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>STAGE LIST ROUTE PROFILE</SCHEDULE>
    <RESULTS>COMPLETED STAGES NEWEST FIRST</RESULTS>
  </STAGES>
  <CLASSIFICATION> -- Tab: Classification
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] general classification, stage winners, jersey standings, withdrawals and official source URL.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STANDINGS>GC POINTS MOUNTAINS YOUTH TEAM IF USED</STANDINGS>
    <OUTCOME>WINNER PODIUM JERSEYS</OUTCOME>
  </CLASSIFICATION>
</RESULTS>
```

## Rules

- Do not create one tab per stage.
- Results must be newest completed stages first.
- Use official race classifications.

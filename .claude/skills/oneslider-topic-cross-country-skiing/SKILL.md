---
name: oneslider-topic-cross-country-skiing
description: Use for OneSlider Cross Country Skiing event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Cross-Country Skiing - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for cross-country skiing races, stage tours and championships.

## Recommended Structure

```
<RESULTS>
  <RACES> -- Tab: Races
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race programme, distances, formats, start times, venue, start lists and source URL.
      Keep future races visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>SPRINT DISTANCE SKIATHLON RELAY MASS START PURSUIT IF USED</SCHEDULE>
  </RACES>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, podiums, times, standings impact and source URL.
      Results must be newest completed races first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>ALL COMPLETED RACES NEWEST FIRST</RESULTS>
    <STANDINGS IMPACT>TOUR / WORLD CUP / CHAMPIONSHIP IMPACT IF RELEVANT</STANDINGS IMPACT>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent start lists, split times or weather changes.
- Results must be newest completed races first.
- Keep format names official.

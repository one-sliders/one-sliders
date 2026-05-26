---
name: oneslider-topic-speed-skating
description: Use for OneSlider Speed Skating event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Speed Skating - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for long-track and short-track speed skating events.

## Recommended Structure

```
<RESULTS>
  <RACES> -- Tab: Races
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race programme, distances, start times, venue, start lists and source URL.
      Keep future races visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>DISTANCES RELAYS MASS START TEAM PURSUIT IF USED</SCHEDULE>
  </RACES>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, times, podiums, records, standings impact and source URL.
      Results must be newest completed races first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>COMPLETED RACES NEWEST FIRST</RESULTS>
    <RECORDS>RECORDS AND STANDINGS IMPACT IF OFFICIAL</RECORDS>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent start lists, times or records.
- Results must be newest completed races first.
- Use official ISU/event sources.

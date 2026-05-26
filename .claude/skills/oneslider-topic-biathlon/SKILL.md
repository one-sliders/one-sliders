---
name: oneslider-topic-biathlon
description: Use for OneSlider Biathlon event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Biathlon - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for biathlon races, World Cup rounds and championships.

## Recommended Structure

```
<RESULTS>
  <RACES> -- Tab: Races
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race programme, disciplines, start times, venue, start lists and source URL.
      Keep future races visible with TBC results. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>SPRINT PURSUIT INDIVIDUAL MASS START RELAY MIXED RELAY IF USED</SCHEDULE>
  </RACES>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, podiums, shooting stats, course times, standings impact and source URL.
      Results must be newest completed races first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>ALL COMPLETED RACES NEWEST FIRST</RESULTS>
    <STATS>SHOOTING SKI TIME PENALTIES STANDINGS IMPACT</STATS>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent start lists or shooting statistics.
- Results must be newest completed races first.
- Keep discipline names official.

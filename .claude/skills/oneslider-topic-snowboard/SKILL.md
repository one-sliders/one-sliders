---
name: oneslider-topic-snowboard
description: Use for OneSlider Snowboard event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Snowboard - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for snowboard competitions, festivals and championships.

## Recommended Structure

```
<RESULTS>
  <EVENTS> -- Tab: Events
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] snowboard event schedule, disciplines, heats/runs, riders, venue and source URL.
      Keep future events visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>SLOPESTYLE HALFPIPE BIG AIR CROSS PARALLEL IF USED</SCHEDULE>
  </EVENTS>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, podiums, scores, standings impact and source URL.
      Results must be newest completed events first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>COMPLETED EVENTS NEWEST FIRST</RESULTS>
    <STANDINGS IMPACT>WORLD CUP / CHAMPIONSHIP IMPACT IF RELEVANT</STANDINGS IMPACT>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent start lists, scores or run details.
- Results must be newest completed events first.
- Keep discipline names official.

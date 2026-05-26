---
name: oneslider-topic-alpine-skiing
description: Use for OneSlider Alpine Skiing event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Alpine Skiing - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for alpine skiing races and championships.

## Recommended Structure

```
<RESULTS>
  <RACES> -- Tab: Races
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race programme, disciplines, start times, course/venue, start lists, source URL and last updated time.
      Keep future races visible with TBC results. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>DOWNHILL SUPER-G GIANT SLALOM SLALOM COMBINED TEAM EVENTS IF USED</SCHEDULE>
  </RACES>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official alpine results, podiums, times, DNFs, standings impact and source URL.
      Results must be newest completed races first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>ALL COMPLETED RACES NEWEST FIRST</RESULTS>
    <STANDINGS IMPACT>WORLD CUP / CHAMPIONSHIP IMPACT IF RELEVANT</STANDINGS IMPACT>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent start lists, times or weather delays.
- Keep discipline names official.
- Results must be newest completed races first.

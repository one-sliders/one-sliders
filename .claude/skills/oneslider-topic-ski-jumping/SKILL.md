---
name: oneslider-topic-ski-jumping
description: Use for OneSlider Ski Jumping event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Ski Jumping - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for ski jumping competitions, tours and championships.

## Recommended Structure

```
<RESULTS>
  <COMPETITIONS> -- Tab: Competitions
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] competition schedule, hill, qualification, trial rounds, start lists and source URL.
      Keep future competitions visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>QUALIFICATION INDIVIDUAL TEAM MIXED TEAM IF USED</SCHEDULE>
  </COMPETITIONS>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, jumps, points, podiums, standings impact and source URL.
      Results must be newest completed competitions first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>COMPLETED COMPETITIONS NEWEST FIRST</RESULTS>
    <STANDINGS IMPACT>TOUR / WORLD CUP / CHAMPIONSHIP IMPACT IF RELEVANT</STANDINGS IMPACT>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent start lists, wind gates or scores.
- Results must be newest completed competitions first.
- Use official FIS/event sources.

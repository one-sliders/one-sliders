---
name: oneslider-topic-figure-skating
description: Use for OneSlider Figure Skating event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Figure Skating - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for figure skating competitions, championships and exhibition events.

## Recommended Structure

```
<RESULTS>
  <SEGMENTS> -- Tab: Segments
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] segments, start times, skaters/teams, venue, status, source URL and last updated time.
      Keep future segments visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>SHORT PROGRAM FREE SKATE RHYTHM DANCE FREE DANCE EXHIBITION IF USED</SCHEDULE>
  </SEGMENTS>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, scores, podiums, segment leaders and source URL.
      Results must be newest completed segments first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>COMPLETED SEGMENTS NEWEST FIRST</RESULTS>
    <STANDINGS>OVERALL STANDINGS PODIUM</STANDINGS>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent scores or starting orders.
- Keep ISU/event segment names official.
- Results must be newest completed segments first.

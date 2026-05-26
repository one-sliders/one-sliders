---
name: oneslider-topic-motorsport
description: Use for OneSlider Motorsport event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Motorsport - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for motorsport events not covered by a more specific topic such as Formula 1 or MotoGP.

## Recommended Structure

```
<RESULTS>
  <WEEKEND SESSIONS> -- Tab: Weekend sessions
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] sessions, qualifying, races, classes, start times, circuit and source URL.
      Results must be newest completed sessions first. Keep future sessions visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>PRACTICE QUALIFYING RACES CLASSES</SCHEDULE>
    <RESULTS>COMPLETED SESSIONS NEWEST FIRST</RESULTS>
  </WEEKEND SESSIONS>
  <RACE RESULT> -- Tab: Race result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race classification, podiums by class, penalties, retirements, standings impact and source URL.
      Use TBC before official results. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>CLASSIFICATION PODIUMS PENALTIES RETIREMENTS</RESULTS>
    <STANDINGS IMPACT>CHAMPIONSHIP IMPACT IF RELEVANT</STANDINGS IMPACT>
  </RACE RESULT>
</RESULTS>
```

## Rules

- Do not create one tab per session.
- Results must be newest completed sessions first.
- Use official timing/classification sources.

---
name: oneslider-topic-multi-sport
description: Use for OneSlider Multi Sport event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Multi Sport - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for multi-sport games and festivals with many disciplines.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] sports programme, dates, venues, participating countries/teams, source URL and last updated time.
      Show newest confirmed schedule updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>SPORTS VENUES DAILY HIGHLIGHTS</SCHEDULE>
  </PROGRAMME>
  <MEDALS OR RESULTS> -- Tab: Medals / results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] medal table, latest results, records, source URL and last updated time.
      Results must be newest completed events first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>LATEST COMPLETED EVENTS NEWEST FIRST</RESULTS>
    <MEDALS>MEDAL TABLE</MEDALS>
  </MEDALS OR RESULTS>
</RESULTS>
```

## Rules

- Do not create one tab per sport.
- Results must be newest completed events first.
- Use official games/event sources.

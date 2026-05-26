---
name: oneslider-topic-olympics
description: Use for OneSlider Olympics event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Olympics - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for Olympic and Paralympic Games pages or Olympic-style events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] sports programme, ceremony dates, venues, participating countries, schedule highlights and source URL.
      Show newest confirmed schedule updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>CEREMONIES SPORTS VENUES DAILY HIGHLIGHTS</SCHEDULE>
  </PROGRAMME>
  <MEDALS> -- Tab: Medals
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] medal table, latest medal events, records, source URL and last updated time.
      Results must be newest completed medal events first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>LATEST MEDAL EVENTS NEWEST FIRST</RESULTS>
    <MEDALS>MEDAL TABLE</MEDALS>
  </MEDALS>
</RESULTS>
```

## Rules

- Do not create one tab per sport.
- Results must be newest completed events first.
- Use official Olympic/Paralympic sources.

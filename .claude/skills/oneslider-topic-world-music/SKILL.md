---
name: oneslider-topic-world-music
description: Use for OneSlider World Music event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# World Music - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for world music festivals, concerts and cultural music programmes.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] lineup, artists, stages/venues, dates, workshops, ticket status and source URL.
      Show newest confirmed lineup updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ARTISTS CONCERTS WORKSHOPS VENUES</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, transport, age rules, accessibility, food/market info if official and first-timer notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS VENUES TRANSPORT AGE RULES</ACCESS>
    <PRACTICAL NOTES>BEST DAYS CULTURAL NOTES FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent artists, cultures represented or set times.
- Keep cultural descriptions respectful and sourced.
- Use official festival sources.

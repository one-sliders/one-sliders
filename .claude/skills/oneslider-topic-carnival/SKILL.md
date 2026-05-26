---
name: oneslider-topic-carnival
description: Use for OneSlider Carnival event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Carnival - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for carnival, parade and street celebration events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] parade programme, routes, dates, music/dance groups, official events, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>PARADES SHOWS STREET EVENTS NEWEST CONFIRMED UPDATES FIRST</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] access, crowd advice, transport, safety, tickets/free areas and weather.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>ROUTES TRANSPORT TICKETS ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>CROWD NOTES SAFETY WEATHER FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent parade routes or performers.
- Keep practical advice location-specific.
- Use official route and safety sources where possible.

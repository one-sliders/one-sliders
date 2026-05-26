---
name: oneslider-topic-tradition
description: Use for OneSlider Tradition event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Tradition - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for traditional festivals, civic rituals, seasonal customs and heritage events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] ceremonies, routes, performances, public events, official schedule and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>CEREMONIES PARADES PERFORMANCES PUBLIC EVENTS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] etiquette, access, tickets/free areas, transport, crowd advice, weather and practical visitor notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS PUBLIC ACCESS TRANSPORT</ACCESS>
    <PRACTICAL NOTES>ETIQUETTE CROWD NOTES WEATHER FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent rituals, origins or meanings.
- Keep cultural descriptions respectful and sourced.
- Use official/local event sources.

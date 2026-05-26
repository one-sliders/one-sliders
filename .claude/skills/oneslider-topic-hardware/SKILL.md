---
name: oneslider-topic-hardware
description: Use for OneSlider Hardware event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Hardware - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for hardware launches, expos, chip events and device showcases.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynote times, exhibitors, demos, product categories, venue and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES DEMOS EXHIBITS WORKSHOPS</AGENDA>
  </PROGRAMME>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official hardware announcements, specs, prices, availability and source URL.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <PRODUCT NOTES>SPECS PRICE AVAILABILITY</PRODUCT NOTES>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent specs, benchmarks, prices or availability.
- Use official sources for products.
- Omit rumors unless a page explicitly supports rumor tracking.

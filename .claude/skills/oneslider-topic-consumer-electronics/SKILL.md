---
name: oneslider-topic-consumer-electronics
description: Use for OneSlider Consumer Electronics event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Consumer Electronics - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for consumer electronics shows, launches and expo events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynote times, exhibitors, product categories, venue, registration and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES EXHIBITS DEMOS MEDIA EVENTS</AGENDA>
  </PROGRAMME>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official product announcements, launch dates, specs, prices, awards and source URL.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <PRODUCT NOTES>SPECS PRICE AVAILABILITY</PRODUCT NOTES>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent specs, prices or release dates.
- Separate rumors from official announcements; omit rumors unless explicitly allowed.
- Use official exhibitor/product sources where possible.

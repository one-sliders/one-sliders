---
name: oneslider-topic-winter
description: Use for OneSlider Winter event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Winter - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for winter festivals, snow events, seasonal events and cold-weather activities.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, activities, venues, dates, ticket/access rules, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ACTIVITIES SHOWS MARKETS SPORT IF OFFICIAL</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] weather, transport, closures, tickets, what to wear/bring and safety notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS TRANSPORT CLOSURES ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>WEATHER WHAT TO BRING SAFETY FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent weather or snow conditions.
- Use official event and meteorological sources for practical claims.
- Keep safety notes factual.

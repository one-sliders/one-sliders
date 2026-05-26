---
name: oneslider-topic-marine
description: Use for OneSlider Marine event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Marine - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for ocean, coast, sailing, marine conservation and maritime events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, sites, boats/exhibits, talks, tours, races if relevant, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>TOURS TALKS EXHIBITS RACES IF USED</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] access, weather/tide notes if official, safety, tickets, transport and environmental rules.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS TRANSPORT MARINA/COAST ACCESS</ACCESS>
    <PRACTICAL NOTES>WEATHER SAFETY TIDES IF OFFICIAL ENVIRONMENTAL RULES</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent tide, weather or safety conditions.
- Use official event, harbour or conservation sources.
- If competitive sailing/racing dominates, use race results newest-first.

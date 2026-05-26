---
name: oneslider-topic-sustainability
description: Use for OneSlider Sustainability event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Sustainability - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for sustainability conferences, campaigns, expos and public action events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, themes, speakers, exhibitors, workshops, venue and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>THEMES SESSIONS SPEAKERS EXHIBITS WORKSHOPS</AGENDA>
  </PROGRAMME>
  <OUTCOMES> -- Tab: Outcomes
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official outcomes, pledges, awards, reports, participation numbers and source URL.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL OUTCOMES NEWEST FIRST</RESULTS>
    <IMPACT>POLICY BUSINESS PUBLIC IMPACT NEXT STEPS</IMPACT>
  </OUTCOMES>
</RESULTS>
```

## Rules

- Do not invent impact claims, pledges or metrics.
- Separate official outcomes from commentary.
- Use official reports/sources where possible.

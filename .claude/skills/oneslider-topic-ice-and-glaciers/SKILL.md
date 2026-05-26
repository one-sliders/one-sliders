---
name: oneslider-topic-ice-and-glaciers
description: Use for OneSlider Ice And Glaciers event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Ice And Glaciers - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for glacier, ice, polar, frozen landscape and cryosphere-related events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, routes/sites, talks, exhibitions, field activities, safety rules, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ACTIVITIES TALKS EXHIBITS ROUTES</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] access, weather, safety, equipment, transport, closures and environmental guidance.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TRANSPORT ROUTES CLOSURES PERMITS</ACCESS>
    <PRACTICAL NOTES>WEATHER SAFETY EQUIPMENT ENVIRONMENTAL RULES</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent safety conditions, closures or environmental claims.
- Use official park, science or event sources.
- Keep advice practical and non-alarmist.

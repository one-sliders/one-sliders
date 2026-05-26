---
name: oneslider-topic-space-tech
description: Use for OneSlider Space Tech event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Space Tech - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for space launches, space technology events, conferences and mission milestones.

## Recommended Structure

```
<RESULTS>
  <MISSION OR PROGRAMME> -- Tab: Mission / programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] mission/event schedule, launch window or agenda, vehicle/payload/speakers, venue/site and source URL.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>LAUNCH WINDOW / AGENDA / MILESTONES</SCHEDULE>
  </MISSION OR PROGRAMME>
  <STATUS> -- Tab: Status
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official status, launch result, mission milestones, announcements, delays and source URL.
      Show newest official updates first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL STATUS NEWEST FIRST</RESULTS>
    <IMPACT>MISSION OUTCOME TECHNOLOGY IMPACT NEXT STEPS</IMPACT>
  </STATUS>
</RESULTS>
```

## Rules

- Do not invent launch windows, payloads or technical claims.
- Use official agency/company sources.
- Keep delays/status updates newest first.

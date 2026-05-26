---
name: oneslider-topic-tech-events
description: Use for OneSlider Tech Events event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Tech Events - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for general technology conferences, expos and launch events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynotes, exhibitors, sessions, speakers, venue, registration and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES SESSIONS EXHIBITS WORKSHOPS</AGENDA>
  </PROGRAMME>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official announcements, product launches, partnerships, awards and event recap.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <IMPACT>BUSINESS DEVELOPER CONSUMER IMPACT</IMPACT>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent product specs, announcements or prices.
- Use official event/company sources.
- Keep practical visitor info in Slide 2, not as extra tabs unless needed.

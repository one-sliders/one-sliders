---
name: oneslider-topic-mobile-telecom
description: Use for OneSlider Mobile Telecom event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Mobile Telecom - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for mobile, telecom, network and connectivity events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynotes, exhibitors, standards tracks, demos, venue and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES EXHIBITS DEMOS STANDARDS TRACKS</AGENDA>
  </PROGRAMME>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official device, network, standard, partnership and product announcements.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <IMPACT>NETWORK DEVICE BUSINESS DEVELOPER IMPACT</IMPACT>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent specs, bands, availability or prices.
- Use official operator/vendor/event sources.
- Separate official announcements from analysis.

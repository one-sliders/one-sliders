---
name: oneslider-topic-developer-conferences
description: Use for OneSlider Developer Conferences event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Developer Conferences - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for developer conferences, SDK events, API launches and technical meetups.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynotes, workshops, speakers, venue, registration status, source URL and last updated time.
      Show newest confirmed agenda updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES WORKSHOPS SESSIONS HACKATHONS</AGENDA>
  </PROGRAMME>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official developer announcements, APIs, SDKs, tools, release notes and recap.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <DEVELOPER IMPACT>APIS SDKS MIGRATION NOTES NEXT STEPS</DEVELOPER IMPACT>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent release notes, APIs or pricing.
- Use official docs or event sources for technical claims.
- Keep announcements concise and practical.

---
name: oneslider-topic-ai
description: Use for OneSlider Ai event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# AI - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for AI conferences, product events, summits and developer showcases.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynotes, sessions, speakers, venue, registration status, source URL and last updated time.
      Show newest confirmed agenda updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES SESSIONS WORKSHOPS DEMOS</AGENDA>
  </PROGRAMME>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] announcements, product launches, model releases, partnerships, developer updates and official recap.
      Use TBC before announcements are official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <IMPACT>DEVELOPER IMPACT BUSINESS IMPACT USER IMPACT</IMPACT>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Use official sources for releases and model/product names.
- Do not speculate about unreleased products.
- If no announcements are made yet, keep the tab visible with TBC.

---
name: oneslider-topic-climate-action
description: Use for OneSlider Climate Action event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Climate Action - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for climate summits, campaigns, negotiations, awareness days and action events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, sessions, speakers, negotiation agenda or campaign actions, venue and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>SESSIONS SPEAKERS ACTIONS NEGOTIATION TRACKS</AGENDA>
  </PROGRAMME>
  <OUTCOMES> -- Tab: Outcomes
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official outcomes, pledges, agreements, attendance, criticism/response from official or reputable sources.
      Use TBC before outcomes are official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL OUTCOMES NEWEST FIRST</RESULTS>
    <IMPACT>POLICY IMPACT PUBLIC IMPACT NEXT STEPS</IMPACT>
  </OUTCOMES>
</RESULTS>
```

## Rules

- Do not invent pledges, emissions numbers or agreements.
- Separate official outcomes from analysis.
- Use TBC until final texts or official releases exist.

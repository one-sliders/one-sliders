---
name: oneslider-topic-beer
description: Use for OneSlider Beer event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Beer - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for beer festivals, brewery events, tastings and competitions.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, breweries, tasting sessions, venues, ticket rules, age rules, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>BREWERIES SESSIONS FOOD MUSIC IF OFFICIAL</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] visitor information: opening hours, tickets, transport, age limits, payment rules and safety notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS HOURS AGE LIMITS TRANSPORT</ACCESS>
    <PRACTICAL NOTES>WHAT TO BOOK WHAT TO BRING FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not promote unsafe drinking.
- Age limits and alcohol rules must be factual and source-based.
- Do not invent participating breweries.

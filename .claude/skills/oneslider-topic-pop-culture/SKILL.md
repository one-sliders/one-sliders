---
name: oneslider-topic-pop-culture
description: Use for OneSlider Pop Culture event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Pop Culture - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for fan conventions, comic cons, media events and pop-culture festivals.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] guests, panels, screenings, exhibitor hall, cosplay/events, ticket status, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>GUESTS PANELS SCREENINGS EXHIBITORS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, venue access, age rules, cosplay/prop rules, transport and first-timer notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS ENTRY VENUE TRANSPORT</ACCESS>
    <PRACTICAL NOTES>COSPLAY RULES AGE RULES FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent guests, panels or announcements.
- Use official convention sources.
- Keep rules and access notes factual.

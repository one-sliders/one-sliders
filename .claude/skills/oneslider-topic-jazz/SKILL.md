---
name: oneslider-topic-jazz
description: Use for OneSlider Jazz event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Jazz - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for jazz festivals, concerts and club programmes.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] line-up, concert schedule, venues, ticket status, source URL and last updated time.
      Show newest confirmed lineup updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ARTISTS CONCERTS VENUES NEWEST CONFIRMED UPDATES FIRST</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, venue access, age rules, transport, late-night sessions and practical visitor notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS VENUES TRANSPORT AGE RULES</ACCESS>
    <PRACTICAL NOTES>BEST NIGHTS CLUB SESSIONS FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent artists or set times.
- Use official line-up and ticket sources.
- Keep genre descriptions concise and specific.

---
name: oneslider-topic-music
description: Use for OneSlider Music event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Music - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for concerts, tours, music festivals and music awards when no narrower music topic fits.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] lineup, schedule, stages/venues, ticket status, source URL and last updated time.
      Show newest confirmed lineup updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ARTISTS SET TIMES STAGES VENUES NEWEST CONFIRMED UPDATES FIRST</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, transport, age rules, entry rules, camping/accommodation if relevant and practical notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS ENTRY TRANSPORT AGE RULES</ACCESS>
    <PRACTICAL NOTES>WHAT TO BRING FIRST-TIMER TIPS WEATHER IF RELEVANT</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent artists, set times or ticket prices.
- Use official line-up and ticket sources.
- Keep stage labels event-specific.

---
name: oneslider-topic-coffee
description: Use for OneSlider Coffee event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Coffee - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for coffee festivals, barista championships, tastings and trade events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, roasters, tastings, workshops, competitions, venues, tickets and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ROASTERS SESSIONS WORKSHOPS COMPETITIONS</PROGRAMME UPDATES>
  </PROGRAMME>
  <RESULTS OR GUIDE> -- Tab: Results / guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] competition results if relevant, or visitor guide if not competitive: access, tickets, highlights and first-timer notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>WINNERS IF OFFICIAL</RESULTS>
    <PRACTICAL NOTES>TICKETS HOURS HIGHLIGHTS FIRST-TIMER TIPS</PRACTICAL NOTES>
  </RESULTS OR GUIDE>
</RESULTS>
```

## Rules

- Use `Results` only if the event officially has competitions.
- Do not invent roasters, sessions or winners.
- Keep tasting and access notes practical.

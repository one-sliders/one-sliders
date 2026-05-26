---
name: oneslider-topic-startups
description: Use for OneSlider Startups event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Startups - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for startup conferences, demo days, pitch competitions and investor events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, speakers, startups, pitch sessions, investor events, venue and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES PITCHES DEMOS NETWORKING</AGENDA>
  </PROGRAMME>
  <OUTCOMES> -- Tab: Outcomes
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] pitch winners, funding/news announcements, awards, official recap and source URL.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>WINNERS ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <IMPACT>STARTUP IMPACT INVESTOR NOTES NEXT STEPS</IMPACT>
  </OUTCOMES>
</RESULTS>
```

## Rules

- Do not invent funding amounts, winners or company claims.
- Use official event/company sources.
- Keep investment language factual, not promotional.

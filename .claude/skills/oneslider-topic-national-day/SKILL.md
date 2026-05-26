---
name: oneslider-topic-national-day
description: Use for OneSlider National Day event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# National Day - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for national days, independence days and civic celebration events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] ceremonies, parades, public events, official schedule, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>CEREMONIES PARADES CONCERTS PUBLIC EVENTS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] transport, closures, crowd advice, security, broadcast info and public access.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TRANSPORT CLOSURES PUBLIC ACCESS</ACCESS>
    <PRACTICAL NOTES>CROWD NOTES SECURITY WEATHER BROADCAST</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent official ceremonies or road closures.
- Keep civic and historical claims neutral and sourced.
- Render every country as flag + name + link.

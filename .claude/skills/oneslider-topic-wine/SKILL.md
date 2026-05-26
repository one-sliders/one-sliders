---
name: oneslider-topic-wine
description: Use for OneSlider Wine event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Wine - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for wine festivals, tastings, harvest events and wine awards.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] wineries, tastings, masterclasses, harvest events, ticket rules, age rules and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>WINERIES TASTINGS MASTERCLASSES FOOD EVENTS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, transport, tasting rules, age rules, payment, safety and practical visitor notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS HOURS TRANSPORT AGE RULES</ACCESS>
    <PRACTICAL NOTES>TASTING RULES SAFETY FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not promote unsafe drinking.
- Do not invent wineries, vintages, prices or award winners.
- Use official festival/winery sources.

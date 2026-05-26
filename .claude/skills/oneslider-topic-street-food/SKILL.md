---
name: oneslider-topic-street-food
description: Use for OneSlider Street Food event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Street Food - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for street food festivals, markets and food-truck events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] vendors, food areas, demos, opening hours, ticket/access rules and source URL.
      Show newest confirmed vendor/programme updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>VENDORS FOOD AREAS DEMOS MUSIC IF OFFICIAL</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets/free entry, payment rules, opening hours, transport, dietary info and practical visitor notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>ENTRY HOURS TRANSPORT PAYMENT</ACCESS>
    <PRACTICAL NOTES>DIETARY NOTES QUEUES FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent vendors, menus or prices.
- Keep dietary/allergy notes source-based.
- Use official market/event sources.

---
name: oneslider-topic-food-drink
description: Use for OneSlider Food Drink event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Food Drink - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for general food and drink festivals, tastings, markets and culinary events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] food/drink programme, vendors, chefs, tastings, demos, ticket rules, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>VENDORS CHEFS TASTINGS DEMOS NEWEST CONFIRMED UPDATES FIRST</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] opening hours, tickets, transport, dietary info, age rules, payment rules and practical visitor notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS HOURS TRANSPORT PAYMENT</ACCESS>
    <PRACTICAL NOTES>DIETARY NOTES AGE RULES FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent vendors, chefs or menus.
- Keep allergy/dietary notes factual and source-based.
- Use official ticket/access information.

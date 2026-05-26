---
name: oneslider-topic-spa
description: Use for OneSlider Spa event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Spa - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for spa, bathing, thermal wellness and resort wellness events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] spa programme, treatments, bathing sessions, workshops, packages, access rules and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>TREATMENTS SESSIONS WORKSHOPS PACKAGES</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] booking, opening hours, age rules, what to bring, etiquette, safety and access.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>BOOKING HOURS AGE RULES ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>WHAT TO BRING ETIQUETTE SAFETY FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent health claims, treatment effects or package prices.
- Keep advice practical and source-based.
- Use official venue/event sources.

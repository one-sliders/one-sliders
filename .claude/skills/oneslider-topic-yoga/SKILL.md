---
name: oneslider-topic-yoga
description: Use for OneSlider Yoga event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Yoga - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for yoga festivals, retreats, workshops and public yoga events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] yoga sessions, teachers, workshops, venues, ticket/booking rules, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>CLASSES WORKSHOPS TEACHERS TALKS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] booking, equipment, levels, accessibility, what to bring, health/safety notes and transport.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>BOOKING VENUE EQUIPMENT ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>LEVELS WHAT TO BRING HEALTH NOTES FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent health claims, teachers or session effects.
- Keep guidance practical and non-medical.
- Use official programme and booking sources.

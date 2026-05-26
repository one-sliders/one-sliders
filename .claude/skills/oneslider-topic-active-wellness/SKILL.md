---
name: oneslider-topic-active-wellness
description: Use for OneSlider Active Wellness event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Active Wellness - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for active wellness events such as retreats, movement classes, wellness races, breathwork, outdoor fitness and recovery-focused programmes.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, dates, sessions, instructors, venues, ticket/access rules, source URL and last updated time.
      Show the most recent confirmed programme updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>SESSIONS CLASSES WORKSHOPS NEWEST CONFIRMED UPDATES FIRST</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] practical visitor information: access, equipment, health/safety notes, weather, what to bring and booking rules.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>BOOKING ARRIVAL EQUIPMENT ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>WHAT TO BRING HEALTH NOTES FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent health claims, instructors, prices or schedules.
- Keep advice practical and non-medical.
- If the event is competitive, use results only for official rankings.

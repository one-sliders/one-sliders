---
name: oneslider-topic-wellness-festivals
description: Use for OneSlider Wellness Festivals event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Wellness Festivals - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for wellness festivals, retreats and multi-track wellbeing events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, sessions, instructors, music/food if relevant, venues, ticket status and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>SESSIONS WORKSHOPS TALKS ACTIVITIES</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, accommodation/camping if relevant, what to bring, health/safety notes, weather and transport.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS ACCOMMODATION TRANSPORT ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>WHAT TO BRING HEALTH NOTES WEATHER FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent health claims, instructors or session effects.
- Keep advice practical and non-medical.
- Use official programme and ticket sources.

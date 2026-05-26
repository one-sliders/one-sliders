---
name: oneslider-topic-mental-health
description: Use for OneSlider Mental Health event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Mental Health - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for mental health awareness events, conferences, walks and public campaigns.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme, speakers, workshops, campaign activities, venue, registration and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>TALKS WORKSHOPS ACTIVITIES CAMPAIGNS</PROGRAMME UPDATES>
  </PROGRAMME>
  <PRACTICAL INFO> -- Tab: Practical info
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] access, participation rules, support resources if official, safety notes and visitor guidance.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>REGISTRATION VENUE ACCESSIBILITY</ACCESS>
    <SUPPORT NOTES>OFFICIAL SUPPORT RESOURCES SAFETY FIRST-TIMER TIPS</SUPPORT NOTES>
  </PRACTICAL INFO>
</RESULTS>
```

## Rules

- Do not provide medical advice or diagnosis.
- Use official support resources only.
- Keep language calm, clear and non-sensational.

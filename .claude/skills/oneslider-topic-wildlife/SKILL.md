---
name: oneslider-topic-wildlife
description: Use for OneSlider Wildlife event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Wildlife - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for wildlife events, migrations, conservation days and nature-viewing events.

## Recommended Structure

```
<RESULTS>
  <PHENOMENON OR PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] wildlife timing, viewing areas, guided activities, conservation programme, source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>VIEWING WINDOWS GUIDED ACTIVITIES CONSERVATION ACTIONS</PROGRAMME UPDATES>
  </PHENOMENON OR PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] access, permits, safety, ethical viewing rules, weather, closures and transport.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>PERMITS ROUTES CLOSURES TRANSPORT</ACCESS>
    <PRACTICAL NOTES>ETHICAL VIEWING SAFETY WEATHER FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent animal locations, migration dates or safety rules.
- Use official park/science/conservation sources.
- Avoid encouraging disturbance of wildlife.

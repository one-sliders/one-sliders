---
name: oneslider-topic-protected-nature
description: Use for OneSlider Protected Nature event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Protected Nature - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for national parks, conservation events, protected-area campaigns and nature access events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] activities, guided walks, talks, conservation actions, locations, permits and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>ACTIVITIES TALKS WALKS CONSERVATION ACTIONS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] access, permits, closures, weather, safety, wildlife/environmental rules and transport.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>PERMITS ROUTES CLOSURES TRANSPORT</ACCESS>
    <PRACTICAL NOTES>SAFETY WEATHER WILDLIFE RULES ENVIRONMENTAL RULES</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent closures, permits or wildlife claims.
- Use official park/conservation sources.
- Keep environmental guidance factual.

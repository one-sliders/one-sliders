---
name: oneslider-topic-weather
description: Use for OneSlider Weather event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Weather - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for weather-related events, seasons, climate phenomena and forecast-dependent happenings.

## Recommended Structure

```
<RESULTS>
  <FORECAST OR PHENOMENON> -- Tab: Forecast / phenomenon
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] expected timing, location, forecast/status, official weather source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <STATUS>FORECAST TIMING CONFIDENCE OFFICIAL WARNINGS IF ANY</STATUS>
  </FORECAST OR PHENOMENON>
  <PRACTICAL INFO> -- Tab: Practical info
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] safety guidance, travel disruption, viewing conditions, preparation notes and official warnings.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TRAVEL ACCESS VIEWING CONDITIONS</ACCESS>
    <PRACTICAL NOTES>SAFETY WARNINGS WHAT TO BRING NEXT UPDATE</PRACTICAL NOTES>
  </PRACTICAL INFO>
</RESULTS>
```

## Rules

- Use official meteorological sources for warnings and forecasts.
- Do not invent weather values or certainty.
- Show last updated time clearly.

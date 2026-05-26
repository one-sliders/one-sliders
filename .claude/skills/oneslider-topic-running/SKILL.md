---
name: oneslider-topic-running
description: Use for OneSlider Running event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Running - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for running races, road races, trail runs and mass-participation events.

## Recommended Structure

```
<RESULTS>
  <RACE INFO> -- Tab: Race info
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race date, distances, route, start time, registration, bib pickup and source URL.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <RACE DETAILS>DISTANCES COURSE START FINISH REGISTRATION</RACE DETAILS>
  </RACE INFO>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, winners, times, records, participation numbers and source URL.
      If the race is upcoming, keep result fields as TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>WINNERS TIMES AGE GROUP / MASS RESULT NOTES IF OFFICIAL</RESULTS>
    <RECORDS>COURSE RECORDS NOTABLE STATS</RECORDS>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent route, start waves or results.
- Use official race sources.
- Keep training/health advice out of event facts.

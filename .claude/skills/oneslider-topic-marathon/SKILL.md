---
name: oneslider-topic-marathon
description: Use for OneSlider Marathon event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Marathon - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for marathons and mass-participation running events.

## Recommended Structure

```
<RESULTS>
  <RACE INFO> -- Tab: Race info
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race date, start time, route, waves, registration, bib pickup, source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <RACE DETAILS>COURSE START FINISH WAVES REGISTRATION</RACE DETAILS>
  </RACE INFO>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official results, winners, times, records, participation numbers and source URL.
      If race is upcoming, keep result fields as TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>ELITE RESULTS AGE GROUP / MASS RESULT NOTES IF OFFICIAL</RESULTS>
    <RECORDS>COURSE RECORDS NOTABLE STATS</RECORDS>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent route details, wave times or records.
- Use official race sources.
- Keep runner advice practical and non-medical.

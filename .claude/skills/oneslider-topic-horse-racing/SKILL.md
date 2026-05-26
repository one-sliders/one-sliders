---
name: oneslider-topic-horse-racing
description: Use for OneSlider Horse Racing event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Horse Racing - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for horse races, race meetings and equestrian racing festivals.

## Recommended Structure

```
<RESULTS>
  <RACES> -- Tab: Races
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] race card, start times, course, runners, jockeys, trainers, source URL and last updated time.
      Keep future races visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>RACE CARD</SCHEDULE>
  </RACES>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official race results, winner, places, times, scratches/non-runners, source URL and last updated time.
      Results must be newest completed races first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>COMPLETED RACES NEWEST FIRST</RESULTS>
    <OUTCOME>WINNERS PLACES NOTABLE RECORDS</OUTCOME>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not provide betting advice.
- Use official race results and official runner lists.
- Results must be newest completed races first.

---
name: oneslider-topic-music-festivals
description: Use for OneSlider Music Festivals event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Music Festivals - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for multi-artist music festivals.

## Recommended Structure

```
<RESULTS>
  <LINEUP> -- Tab: Lineup
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] lineup, headliners, stages, dates, set times if announced, source URL and last updated time.
      Show newest confirmed lineup updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>HEADLINERS STAGE SCHEDULE SET TIMES IF OFFICIAL</PROGRAMME UPDATES>
  </LINEUP>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] tickets, camping, transport, age rules, entry rules, weather and first-timer notes.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>TICKETS CAMPING TRANSPORT ENTRY RULES</ACCESS>
    <PRACTICAL NOTES>WHAT TO BRING WEATHER FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not create one tab per stage or artist.
- Do not invent set times or ticket tiers.
- Use official festival sources.

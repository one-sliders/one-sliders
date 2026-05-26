---
name: oneslider-topic-cricket
description: Use for OneSlider Cricket event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Cricket - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for cricket matches, series and tournaments.

## Recommended Structure

```
<RESULTS>
  <MATCHES> -- Tab: Matches
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] fixtures, match dates, venues, teams, formats, completed scores, source URL and last updated time.
      Results must be newest completed matches first. Keep future matches visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>MATCH LIST</SCHEDULE>
    <RESULTS>COMPLETED MATCHES NEWEST FIRST</RESULTS>
  </MATCHES>
  <STANDINGS OR RESULT> -- Tab: Standings / result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] table, series score, winner, top performers and official recap.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STANDINGS>TABLE OR SERIES SCORE</STANDINGS>
    <OUTCOME>WINNER PLAYER OF THE SERIES TOP PERFORMERS</OUTCOME>
  </STANDINGS OR RESULT>
</RESULTS>
```

## Rules

- Do not create one tab per innings or match.
- Use official score sources.
- Results must be newest completed matches first.

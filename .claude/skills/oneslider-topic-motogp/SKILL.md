---
name: oneslider-topic-motogp
description: Use for OneSlider Motogp event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# MotoGP - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for MotoGP race weekends.

## Recommended Structure

```
<RESULTS>
  <WEEKEND SESSIONS> -- Tab: Weekend sessions
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] MotoGP weekend sessions, practice, qualifying, sprint if used, race times, source URL and last updated time.
      Results must be newest completed sessions first. Keep future sessions visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>PRACTICE QUALIFYING SPRINT IF USED RACE</SCHEDULE>
    <RESULTS>COMPLETED SESSIONS NEWEST FIRST</RESULTS>
  </WEEKEND SESSIONS>
  <RACE> -- Tab: Race
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] MotoGP race grid, classification, podium, fastest lap, retirements, championship impact and source URL.
      Use TBC before the race. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <GRID>STARTING GRID POLE POSITION</GRID>
    <RESULTS>RACE CLASSIFICATION PODIUM FASTEST LAP</RESULTS>
    <STANDINGS IMPACT>RIDERS TEAMS CONSTRUCTORS</STANDINGS IMPACT>
  </RACE>
</RESULTS>
```

## Rules

- Do not create one tab per session.
- Results must be newest completed sessions first.
- Use official MotoGP/session sources.

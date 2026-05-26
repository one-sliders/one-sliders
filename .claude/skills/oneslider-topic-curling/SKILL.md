---
name: oneslider-topic-curling
description: Use for OneSlider Curling event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Curling - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for curling championships, bonspiels and finals.

## Recommended Structure

```
<RESULTS>
  <ROUND ROBIN> -- Tab: Round robin
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] round robin fixtures, latest completed games, standings, qualification line, source URL and last updated time.
      Results must be newest completed games first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <RESULTS>ALL ROUND ROBIN RESULTS NEWEST FIRST</RESULTS>
    <STANDINGS>TABLE QUALIFICATION LINE</STANDINGS>
  </ROUND ROBIN>
  <PLAYOFFS> -- Tab: Playoffs
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] playoffs, semifinals, medal games/finals, latest results, source URL and last updated time.
      Keep round grouping; sort games newest-first inside each round. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <BRACKET>PLAYOFF TREE</BRACKET>
    <RESULTS>PLAYOFF RESULTS GROUPED BY ROUND</RESULTS>
    <OUTCOME>CHAMPION RUNNER-UP BRONZE IF AWARDED</OUTCOME>
  </PLAYOFFS>
</RESULTS>
```

## Rules

- Do not show playoffs before they exist; use TBC placeholders.
- Results must be newest completed games first.
- Render countries as flag + name + link.

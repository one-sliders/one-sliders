---
name: oneslider-topic-golf
description: Use for OneSlider Golf event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Golf - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for golf tournaments, majors and team events.

## Recommended Structure

```
<RESULTS>
  <ROUNDS> -- Tab: Rounds
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] rounds, tee times, course, field, cut line, leaderboard, source URL and last updated time.
      Results must be newest completed rounds first. Keep future rounds visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>ROUND 1 ROUND 2 ROUND 3 ROUND 4</SCHEDULE>
    <RESULTS>ROUND UPDATES NEWEST FIRST</RESULTS>
  </ROUNDS>
  <LEADERBOARD> -- Tab: Leaderboard
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official leaderboard, scores, cut, winner if complete, prize/points impact if relevant and source URL.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STANDINGS>LEADERBOARD CUT LINE</STANDINGS>
    <OUTCOME>WINNER PODIUM / TOP FINISHERS</OUTCOME>
  </LEADERBOARD>
</RESULTS>
```

## Rules

- Do not create one tab per round.
- Use official leaderboards.
- Results must be newest completed rounds first.

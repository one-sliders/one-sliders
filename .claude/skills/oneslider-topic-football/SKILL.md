---
name: oneslider-topic-football
description: Use for OneSlider Football event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Football - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for football matches, finals, tournaments and leagues.

## Recommended Structure

```
<RESULTS>
  <MATCHES> -- Tab: Matches
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] fixtures, teams, venues, kickoff times, completed results, source URL and last updated time.
      Results must be newest completed matches first. Keep future matches visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>MATCH LIST</SCHEDULE>
    <RESULTS>COMPLETED MATCHES NEWEST FIRST</RESULTS>
  </MATCHES>
  <STANDINGS OR KNOCKOUTS> -- Tab: Standings / knockouts
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] standings, bracket, qualification line, finalists, champion if complete and official source URL.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STANDINGS>TABLE OR GROUPS IF USED</STANDINGS>
    <BRACKET>KNOCKOUT TREE IF USED</BRACKET>
    <OUTCOME>WINNER RUNNER-UP THIRD PLACE ONLY IF AWARDED</OUTCOME>
  </STANDINGS OR KNOCKOUTS>
</RESULTS>
```

## Rules

- Do not create one tab per match.
- Use `Standings` for leagues/groups and `Knockouts` for brackets.
- Results must be newest completed matches first.

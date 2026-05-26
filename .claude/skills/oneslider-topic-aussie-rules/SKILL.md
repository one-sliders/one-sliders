---
name: oneslider-topic-aussie-rules
description: Use for OneSlider Aussie Rules event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Aussie Rules - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for Australian rules football finals, rounds and showcase matches.

## Recommended Structure

```
<RESULTS>
  <MATCH> -- Tab: Match
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] match details: teams, venue, bounce time, squads, status, source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <BUILDUP>TEAMS FORM KEY MATCHUPS</BUILDUP>
  </MATCH>
  <RESULT> -- Tab: Result
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] final score, quarter scores, best players, goals, crowd and official recap.
      If the match has not started, keep result fields as TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>FINAL SCORE QUARTER SCORES BEST PLAYERS GOALS</RESULTS>
  </RESULT>
</RESULTS>
```

## Rules

- Do not create one tab per quarter.
- Use official AFL/event sources for scores.
- Keep labels understandable for non-local visitors.

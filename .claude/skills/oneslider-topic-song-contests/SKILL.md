---
name: oneslider-topic-song-contests
description: Use for OneSlider Song Contests event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Song Contests - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for Eurovision-style contests, national finals and music competitions.

## Recommended Structure

```
<RESULTS>
  <SHOWS> -- Tab: Shows
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] semi-finals, final, participants, running order, hosts, venue, source URL and last updated time.
      Keep future shows visible with TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <SCHEDULE>SEMI-FINALS FINAL RUNNING ORDER</SCHEDULE>
  </SHOWS>
  <RESULTS> -- Tab: Results
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] qualifiers, final results, jury/televote split if official, winner and source URL.
      Results must be newest completed shows first. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>QUALIFIERS FINAL RESULT VOTING IF OFFICIAL</RESULTS>
    <OUTCOME>WINNER RUNNER-UP HOST RIGHTS IF RELEVANT</OUTCOME>
  </RESULTS>
</RESULTS>
```

## Rules

- Do not invent running orders, qualifiers or voting points.
- Results must be newest completed shows first.
- Use official broadcaster/contest sources.

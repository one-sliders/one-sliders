---
name: oneslider-topic-gaming
description: Use for OneSlider Gaming event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Gaming - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for gaming events, esports tournaments, showcases and game awards.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] schedule, games, matches/showcases, streams, teams/speakers, source URL and last updated time.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>MATCHES SHOWCASES PANELS STREAMS</AGENDA>
  </PROGRAMME>
  <RESULTS OR ANNOUNCEMENTS> -- Tab: Results / announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official esports results or game announcements, winners, trailers, release dates and recap.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>WINNERS OR ANNOUNCEMENTS NEWEST FIRST</RESULTS>
  </RESULTS OR ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent game announcements, release dates or match results.
- Use official tournament/showcase sources.
- If the event is esports, results must be newest completed matches first.

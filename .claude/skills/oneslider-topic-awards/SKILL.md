---
name: oneslider-topic-awards
description: Use for OneSlider Awards event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Awards - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for awards ceremonies across culture, sport, media, food, technology and public life.

## Recommended Structure

```
<RESULTS>
  <NOMINATIONS> -- Tab: Nominations
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] nominations, categories, nominees, ceremony date, host/venue, source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <NOMINATIONS>CATEGORIES NOMINEES SHORTLISTS</NOMINATIONS>
  </NOMINATIONS>
  <WINNERS> -- Tab: Winners
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] winners, category results, notable records, official recap and source URL.
      If winners are not announced yet, keep winner fields as TBC. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>WINNERS BY CATEGORY NEWEST OFFICIAL UPDATES FIRST</RESULTS>
    <RECORDS>NOTABLE RECORDS FIRSTS OR MILESTONES</RECORDS>
  </WINNERS>
</RESULTS>
```

## Rules

- Do not publish predicted winners as results.
- Keep category names official.
- If nominations are not announced, use TBC.

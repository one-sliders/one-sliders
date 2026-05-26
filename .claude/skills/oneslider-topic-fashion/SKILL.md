---
name: oneslider-topic-fashion
description: Use for OneSlider Fashion event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Fashion - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for fashion weeks, runway shows, design fairs and fashion awards.

## Recommended Structure

```
<RESULTS>
  <SHOWS> -- Tab: Shows
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] schedule, designers, venues, runway shows, presentations, source URL and last updated time.
      Show newest confirmed programme updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>SHOWS PRESENTATIONS DESIGNERS NEWEST CONFIRMED UPDATES FIRST</PROGRAMME UPDATES>
  </SHOWS>
  <HIGHLIGHTS> -- Tab: Highlights
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official highlights, award winners if relevant, notable collections, public access and recap.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <HIGHLIGHTS>COLLECTIONS AWARDS TRENDS OFFICIAL RECAP</HIGHLIGHTS>
  </HIGHLIGHTS>
</RESULTS>
```

## Rules

- Do not invent designers, shows or trends.
- Keep fashion claims sourced or clearly tied to official recap.
- Use awards only when official.

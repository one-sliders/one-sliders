---
name: oneslider-topic-cybersecurity
description: Use for OneSlider Cybersecurity event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Cybersecurity - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for cybersecurity conferences, competitions and industry events.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] agenda, keynotes, tracks, workshops, CTF events, speakers, venue and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTES TRACKS WORKSHOPS CTF IF OFFICIAL</AGENDA>
  </PROGRAMME>
  <OUTCOMES> -- Tab: Outcomes
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official announcements, competition winners, research releases, advisories and event recap.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL OUTCOMES NEWEST FIRST</RESULTS>
    <IMPACT>SECURITY RESEARCH INDUSTRY IMPACT NEXT STEPS</IMPACT>
  </OUTCOMES>
</RESULTS>
```

## Rules

- Do not invent vulnerabilities, CVEs or exploit details.
- Keep security claims sourced.
- Use results only for official competitions or announcements.

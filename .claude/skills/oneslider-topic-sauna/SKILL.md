---
name: oneslider-topic-sauna
description: Use for OneSlider Sauna event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Sauna - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for sauna events, sauna festivals, wellness expos and sauna-related product/topic pages.

## Recommended Structure

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] sauna programme, sessions, venues, competitions, workshops, ticket/access rules and source URL.
      Show newest confirmed updates first. Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>SAUNA SESSIONS WORKSHOPS COMPETITIONS DEMOS</PROGRAMME UPDATES>
  </PROGRAMME>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] practical sauna guidance: booking, temperature norms if official, what to bring, safety, bathing etiquette and access.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>BOOKING HOURS VENUES ACCESSIBILITY</ACCESS>
    <PRACTICAL NOTES>WHAT TO BRING ETIQUETTE SAFETY TEMPERATURE NOTES</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Do not invent health claims or medical benefits.
- Keep temperature/safety advice source-based.
- If products are shown, keep affiliate/commercial content separate from event facts.

---
name: oneslider-topic-religion
description: Use for OneSlider Religion event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Religion - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for religious observances, pilgrimages, festivals and ceremonies.

## Recommended Structure

```
<RESULTS>
  <OBSERVANCE> -- Tab: Observance
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] dates, ceremonies, sites, public programme, official guidance, source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <PROGRAMME UPDATES>CEREMONIES OBSERVANCES PUBLIC EVENTS</PROGRAMME UPDATES>
  </OBSERVANCE>
  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] visitor etiquette, access, transport, crowd/safety guidance, dress rules if official and public restrictions.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <ACCESS>PUBLIC ACCESS TRANSPORT RESTRICTIONS</ACCESS>
    <PRACTICAL NOTES>ETIQUETTE DRESS RULES SAFETY FIRST-TIMER TIPS</PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Rules

- Keep tone respectful and factual.
- Do not invent doctrine, rituals or restrictions.
- Use official event/religious/community sources where possible.

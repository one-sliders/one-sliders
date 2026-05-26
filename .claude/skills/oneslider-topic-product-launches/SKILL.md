---
name: oneslider-topic-product-launches
description: Use for OneSlider Product Launches event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Product Launches - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

Use this topic for product launch events across technology, consumer goods and entertainment.

## Recommended Structure

```
<RESULTS>
  <EVENT> -- Tab: Event
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] launch date, livestream, venue, announced agenda, company/source URL and last updated time.
      Use TBC for unconfirmed values. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>NAME TIME LOCATION DESCRIPTION</STAGE INFO>
    <AGENDA>KEYNOTE DEMOS RELEASE TIMELINE</AGENDA>
  </EVENT>
  <ANNOUNCEMENTS> -- Tab: Announcements
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] official products, specs/features, pricing, availability, preorder dates and source URL.
      Use TBC until official. Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <RESULTS>OFFICIAL ANNOUNCEMENTS NEWEST FIRST</RESULTS>
    <PRODUCT NOTES>FEATURES PRICE AVAILABILITY PREORDER</PRODUCT NOTES>
  </ANNOUNCEMENTS>
</RESULTS>
```

## Rules

- Do not invent specs, prices or dates.
- Keep rumors out unless explicitly requested.
- Use official product/company sources.

---
name: oneslider-topic-art
description: Use for OneSlider Art event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Art - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

The stage section must adapt to art events, light festivals and exhibition-based programmes. Do not invent competition results for events that are not competitive. Keep the structure focused on what visitors can see and how the event works on site.

Use one of these structures:

1. Public art or light festival: installations/programme and visitor guide, such as Vivid Sydney.
2. Exhibition or biennial: exhibitions and venues.
3. Art prize or competitive event: shortlist and awards.

## Format A: Public Art Or Light Festival

Use this when the event is a city-wide public programme with installations, zones, performances or talks.

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme.
      Find official dates, zones, major installations, nightly schedule, free and ticketed highlights, source URL and last updated time.
      Show the most recent confirmed programme updates first.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <ZONES>
      MAIN PRECINCTS
      INSTALLATIONS
      PERFORMANCES
      TALKS / IDEAS, IF PART OF THE EVENT
    </ZONES>
    <PROGRAMME UPDATES>
      LATEST CONFIRMED HIGHLIGHTS
      NEWEST CONFIRMED UPDATES FIRST
    </PROGRAMME UPDATES>
  </PROGRAMME>

  <VISITOR GUIDE> -- Tab: Visitor guide
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] visitor guide.
      Find opening hours, best viewing times, access and transport notes, ticket rules, crowd advice, weather considerations, source URL and last updated time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <ACCESS>
      OPENING HOURS
      TRANSPORT
      ACCESSIBILITY
      TICKETED / FREE AREAS
    </ACCESS>
    <PRACTICAL NOTES>
      BEST TIMES
      CROWD NOTES
      WEATHER NOTES
      FIRST-TIMER TIPS
    </PRACTICAL NOTES>
  </VISITOR GUIDE>
</RESULTS>
```

## Format B: Exhibition Or Biennial

Use this when the event is structured around exhibitions, venues or curatorial sections.

```
<RESULTS>
  <EXHIBITIONS> -- Tab: Exhibitions
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] exhibitions.
      Find exhibition sections, curators, artists, venues, dates, source URL and last updated time.
      Show the most recent confirmed programme updates first.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <EXHIBITIONS>
      MAIN EXHIBITION
      SATELLITE EXHIBITIONS
      ARTISTS
      CURATORS
    </EXHIBITIONS>
  </EXHIBITIONS>

  <VENUES> -- Tab: Venues
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] venues.
      Find venue list, opening hours, access rules, transport notes, source URL and last updated time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <VENUES>
      VENUE LIST
      ACCESS
      OPENING HOURS
    </VENUES>
  </VENUES>
</RESULTS>
```

## Format C: Art Prize Or Competitive Event

Use this when the event has shortlisted artists and official winners.

```
<RESULTS>
  <SHORTLIST> -- Tab: Shortlist
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] shortlist.
      Find shortlisted artists, works, exhibition dates, source URL and last updated time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <SHORTLIST>
      ARTISTS
      WORKS
      VENUE
    </SHORTLIST>
  </SHORTLIST>

  <AWARDS> -- Tab: Awards
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] awards.
      Find official winners, prize categories, jury notes if official, source URL and last updated time.
      If awards are not announced yet, keep winner fields as TBC.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <RESULTS>
      WINNERS
      COMMENDATIONS
      JURY NOTES, IF OFFICIAL
    </RESULTS>
  </AWARDS>
</RESULTS>
```

## Rules

- For Vivid Sydney, use `Programme` and `Visitor guide`.
- Do not create `Results` or `Awards` unless the event officially has a competitive prize.
- Do not create one tab per installation, precinct or venue.
- If data is not confirmed, write `TBC`; do not invent artworks, artists, times, venues or access rules.
- Show latest confirmed programme updates first.
- Keep visitor guidance practical and event-specific.
- Keep stage labels user-facing and event-specific.

## Rendering And Update Rules

- Each programme or guide block must use one continuous wrapper in the rendered page.
- Do not close and reopen the same wrapper inside the same stage block.
- Keep future installations, venues and practical notes visible with `TBC` placeholders where needed.
- Add a status note to every programme or visitor-guide block.
- Use this update-status pattern:

```
<match-note>
  Updated after [LATEST_OFFICIAL_UPDATE]. Next expected update: [NEXT_UPDATE_OR_TBC].
</match-note>
```

- If the programme is not fully announced yet, use:

```
<match-note>
  Full programme is not confirmed yet. Confirmed highlights should appear here first.
</match-note>
```

## Format Selection Prompt

Before choosing a structure, research `[EVENT_NAME] [YEAR]` and identify the real art event format:

- Public art or light festival
- Exhibition / biennial
- Art prize or competitive event
- Other

Then choose the matching XML-like structure above. Do not create stages that `[EVENT_NAME]` does not actually use.

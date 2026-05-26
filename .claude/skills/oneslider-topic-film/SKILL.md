---
name: oneslider-topic-film
description: Use for OneSlider Film event/topic pages; defines parts structure, research prompts, TBC rules, and source/flag requirements.
---

# Film - Stage Section

## Stage Div

`<section id="parts" data-slide="parts">`

## Purpose

The stage section must adapt to film festivals and film awards. Do not turn a festival into a sports-style bracket. Keep the structure focused on programme, selections and awards.

Use one of these structures:

1. Film festival: programme and awards, such as Cannes Film Festival.
2. Film awards ceremony: nominations and winners.
3. Single premiere or screening event: screening details and reception.

## Format A: Film Festival

Use this when the event has screenings, sections, premieres, jury activity and awards.

```
<RESULTS>
  <PROGRAMME> -- Tab: Programme
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] programme.
      Find official sections, competition lineup, notable premieres, jury, screening dates if available, industry market items if relevant, source URL and last updated time.
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
    <SECTIONS>
      COMPETITION
      OUT OF COMPETITION
      SPECIAL SCREENINGS
      OTHER OFFICIAL SECTIONS
    </SECTIONS>
    <PROGRAMME UPDATES>
      LATEST CONFIRMED SCREENINGS OR ANNOUNCEMENTS
      NEWEST CONFIRMED UPDATES FIRST
    </PROGRAMME UPDATES>
    <JURY>
      JURY PRESIDENT
      JURY MEMBERS
    </JURY>
  </PROGRAMME>

  <AWARDS> -- Tab: Awards
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] awards.
      Find award status, winners if announced, nominated or competing films, Palme d'Or or top prize, jury prizes, source URL and last updated time.
      If awards are not announced yet, keep winner fields as TBC and show when awards are expected.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <AWARD STATUS>
      CEREMONY DATE
      CURRENT STATUS
      TOP PRIZE STATUS
    </AWARD STATUS>
    <RESULTS>
      TOP PRIZE
      GRAND PRIX
      JURY PRIZE
      BEST DIRECTOR
      BEST ACTOR / ACTRESS, IF AWARDED
      OTHER OFFICIAL AWARDS
    </RESULTS>
  </AWARDS>
</RESULTS>
```

## Format B: Film Awards Ceremony

Use this when the event is primarily an awards ceremony.

```
<RESULTS>
  <NOMINATIONS> -- Tab: Nominations
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] nominations.
      Find nomination list, categories, nominated films or people, ceremony date, source URL and last updated time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <NOMINATIONS>
      MAIN CATEGORIES
      NOMINEES
    </NOMINATIONS>
  </NOMINATIONS>

  <WINNERS> -- Tab: Winners
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] winners.
      Find official winners, category results, notable records, source URL and last updated time.
      If winners are not announced yet, keep winner fields as TBC.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <RESULTS>
      OFFICIAL WINNERS BY CATEGORY
    </RESULTS>
    <RECORDS>
      NOTABLE RECORDS OR FIRSTS
    </RECORDS>
  </WINNERS>
</RESULTS>
```

## Format C: Single Premiere Or Screening

Use this when the event is one screening, premiere or red-carpet event.

```
<RESULTS>
  <SCREENING> -- Tab: Screening
    <AI_RESEARCH_PROMPT>
      Research [EVENT_NAME] [YEAR] screening.
      Find film title, date, venue, guests if announced, access rules, reception if complete, source URL and last updated time.
      Use TBC for unconfirmed values.
      Render every country reference as flag + name + link.
    </AI_RESEARCH_PROMPT>
    <STAGE INFO>
      NAME
      TIME
      LOCATION
      DESCRIPTION
    </STAGE INFO>
    <DETAILS>
      FILM
      VENUE
      GUESTS
      ACCESS
    </DETAILS>
    <RECEPTION>
      REVIEWS / AWARDS / OUTCOME IF COMPLETE
    </RECEPTION>
  </SCREENING>
</RESULTS>
```

## Rules

- For Cannes Film Festival, use `Programme` and `Awards`.
- Do not create sports-style `Group stage`, `Playoffs` or `Results` tabs.
- Do not create a separate `Market` tab unless the event page is specifically about the film market; include market notes inside `Programme`.
- If data is not confirmed, write `TBC`; do not invent films, juries, awards, screening times or winners.
- Show latest confirmed programme updates first.
- Keep award categories official to the event.
- Keep stage labels user-facing and event-specific.

## Rendering And Update Rules

- Each results or programme block must use one continuous wrapper in the rendered page.
- Do not close and reopen the same wrapper inside the same stage block.
- If awards have not been announced, keep award rows visible with `TBC` instead of hiding the tab.
- Add a status note to every programme or awards block.
- Use this update-status pattern:

```
<match-note>
  Updated after [LATEST_OFFICIAL_UPDATE]. Next expected update: [NEXT_UPDATE_OR_TBC].
</match-note>
```

- If no awards have been announced yet, use:

```
<match-note>
  Awards have not been announced yet. Winners should appear here once official.
</match-note>
```

## Format Selection Prompt

Before choosing a structure, research `[EVENT_NAME] [YEAR]` and identify the real film event format:

- Film festival
- Film awards ceremony
- Single premiere or screening
- Other

Then choose the matching XML-like structure above. Do not create stages that `[EVENT_NAME]` does not actually use.

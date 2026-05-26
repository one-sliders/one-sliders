# OneSliders — Event Page Specification

This document specifies how event pages on OneSliders are built. **Follow it literally.** Do not improvise layouts, components, or features that are not described here. If something is unclear, ask before implementing.

## 1. Purpose

OneSliders is built for people who want to know about events. The site is visual, fast, and inviting. Each event page is a short, scrollable presentation — three full-screen panels — not a long article and not a dashboard.

## 2. Hard Rules — Do Not Violate

These rules are absolute. If a rule conflicts with anything you would otherwise do, the rule wins.

1. **Each event has exactly ONE URL.** No per-year URLs. No per-part URLs.
2. **Each event page has exactly THREE slides** (or two if the event has no parts): General, Year, Parts.
3. **The page is a horizontal carousel.** Each slide fills 100vw × 100vh. A "Next" button slides the next one in. The user never sees stacked vertical sections.
4. **The top navigation is fixed** (see Section 4): three icons (Events, Locations, Categories) + language switcher. Nothing else. Never duplicate slide navigation (General/Year/Parts) in the top bar.
5. **No sidebar.** Layout inside a slide is single-column, full-width.
6. **No tab widgets for primary parts.** Parts are sub-sections within Slide 3. Compact tab widgets are allowed inside a part only for closely comparable live subgroups, such as Group A / Group B upcoming fixtures.
7. **Every country reference is rendered as `flag + name + link`** to that country's location page. Always. Inside tables, inside lists, inside fact boxes, inline in text. Plain-text country names are forbidden.
8. **The flag image must match the country name and link.** Argentina flag only next to "Argentina". Brazil flag only next to "Brazil". Never substitute.
9. **No white text on white background.** Text contrast must be checked against the actual card background.
10. **Shared `events.css` and `events.js` only.** No inline styles. No inline scripts. No per-page CSS or JS files. **`events.css` defines layout only — no per-event color or font overrides.**
11. **Every event has exactly two images:** `{slug}-hero.png` (1200×630) and `{slug}-mini.png` (400×300). Both required. Same visual style.
12. **No empty slides.** A slide that lacks content must be replaced with evergreen content, not hidden, not left blank.
13. **Slide 2 must let the user navigate to the last 5 editions.** Only Slide 2 changes when switching year. Slide 1 and Slide 3 do not.

## 3. URL Structure

Pattern: `/{topic-path}/events/{event-slug}.html`

Examples:
- `/sport/golf/events/us-open.html`
- `/sport/football/events/fifa-world-cup.html`
- `/music/song-contests/events/eurovision.html`
- `/culture/beer-festivals/events/oktoberfest.html`

The URL never contains a year, month, or part. The page is evergreen and updates over time.

Country and city pages live in a parallel taxonomy and are reached via links only:
- `/locations/europe/austria/`
- `/locations/europe/austria/vienna.html`

## 4. Top Navigation — Fixed Across the Site

Every event page has the **same top navigation bar**. It is defined here so it is identical on every page.

### Required elements (in this order, left to right)

1. **Events icon** — links to `/content/events/index.html`. Calendar icon.
2. **Locations icon** — links to `/content/locations/index.html`. Globe icon.
3. **Categories icon** — links to `/content/categories/index.html`. Grid icon.
4. **Spacer / flex gap**
5. **Language switcher** — small dropdown showing current language (e.g. "EN"), right-aligned.

That is the entire top navigation. Nothing else.

### Forbidden in the top navigation

- **No slide navigation** (General / Year / Parts). Slide navigation lives in the bottom dots/prev/next buttons only. Never duplicate it in the top bar.
- No topic pill (e.g. "Football"). The user reached this page via a topic; the topic link is reachable through Categories.
- No event title. The title belongs inside Slide 1.
- No search bar.
- No social icons.
- No "save" or "share" buttons (those live inside slides).

### HTML skeleton

```html
<nav class="event-nav" aria-label="Site navigation">
  <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><!-- calendar icon --></a>
  <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><!-- globe icon --></a>
  <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><!-- grid icon --></a>
  <span class="nav-spacer"></span>
  <details class="nav-language">
    <summary aria-label="Language">EN</summary>
    <div class="nav-language__list"><!-- language links --></div>
  </details>
</nav>
```

The three icons use the same SVG style across the site. Styling (size, color, spacing) lives in `events.css`.

## 5. Page Layout — Carousel of Full-Screen Slides

Each event page is a **horizontal carousel** of full-screen slides. Only one slide is visible at a time. A "Next" button slides the next one in. A "Previous" button slides the previous one back.

This is the OneSliders signature presentation. It is not negotiable. Do not render the page as a vertical scroll of stacked sections.

### Visual model

```
viewport: 100vw × 100vh

[ Slide 1: General ] -> press Next -> [ Slide 2: Year ] -> press Next -> [ Slide 3: Parts ]
                       <- Previous                       <- Previous
```

- Each slide fills exactly **100vw width and 100vh height**. The whole viewport. No margins, no surrounding white space, no visible neighbouring slides.
- Slides are positioned side by side horizontally inside a track that translates left/right.
- Transition between slides is a smooth horizontal slide animation (around 400–600ms, ease-in-out).
- A slide indicator (3 dots or labels: "General / Year / Parts") sits at the bottom of the viewport, fixed.
- A "Next" button is fixed on the right edge of the viewport (vertically centered or bottom-right). A "Previous" button on the left edge appears once the user is past slide 1.
- The carousel must also respond to keyboard arrows and touch swipe.
- Within a slide, content may scroll vertically if it exceeds the height, but the slide itself does not move; only the inner content scrolls.

### Required HTML skeleton

```html
<!doctype html>
<html lang="{lang}">
<head>
  <link rel="stylesheet" href="/assets/css/events.css">
  <script defer src="/assets/js/events.js"></script>
  <!-- meta, schema, etc -->
</head>
<body class="event-page">

  <nav class="event-nav"><!-- Top nav per Section 4. Three icons only + language switcher. --></nav>

  <main class="event-carousel" data-carousel>
    <div class="event-carousel__track" data-carousel-track>

      <section class="event-slide" id="general" data-slide="general">
        <!-- Section 1 content -->
      </section>

      <section class="event-slide" id="year" data-slide="year">
        <!-- Section 2 content -->
      </section>

      <section class="event-slide" id="parts" data-slide="parts">
        <!-- Section 3 content (only if event has parts) -->
      </section>

    </div>

    <button class="event-carousel__prev" data-carousel-prev aria-label="Previous slide"></button>
    <button class="event-carousel__next" data-carousel-next aria-label="Next slide"></button>
    <nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav>
  </main>

</body>
</html>
```

Rules for the skeleton:
- `.event-carousel` is positioned fixed/absolute to fill the viewport (100vw × 100vh, no overflow).
- `.event-carousel__track` is a horizontal flex container with `transform: translateX(...)` controlled by JS.
- `.event-slide` is `width: 100vw; height: 100vh; flex-shrink: 0;`.
- The prev/next buttons are large, easy to tap, always visible (except prev on slide 1, next on the last slide).
- No `<aside>`. No second column. No sidebar. No tab widgets for primary parts. Compact in-card tabs are allowed for comparable live subgroups inside a part.
- Anchor links (`#general`, `#year`, `#parts`) work by snapping the carousel to that slide.

## 6. Slide Content Design

Each slide is a full-screen visual presentation, not a document. Keep content tight: every slide is something the user takes in at a glance, then optionally scrolls inside.

### Visual rules per slide

- **Background:** the hero image fills the slide as a background (cover, centered). A dark overlay (linear gradient or solid 40–60% black) sits on top of the image so text is readable.
- **Text on dark backgrounds is white or near-white.** Text on white cards is dark. Never white text on white card.
- **Cards on top of the hero must have a solid or semi-opaque background** (white, white-with-blur, or dark-with-blur) so they are clearly readable. Card content uses the card's contrasting text color.
- **Generous padding inside cards.** Headings inside cards are bold and clearly larger than body text.
- **Typography hierarchy:** H1 = event name (very large on slide 1), H2 = section titles within a slide, body text comfortable to read.
- **No vertical scroll** if the content can fit. Use the carousel for major navigation, not scroll within slides, unless the content genuinely exceeds the viewport.

### Contrast rule (mandatory)

Before rendering any element, check the text color against its actual background:
- Light text only on dark or image background with overlay.
- Dark text only on light card background.
- If a card has a white background, all text and labels inside it are dark gray or black. **No white-on-white. No light-gray-on-white.**

This rule applies to every fact box, every label, every value, every link. If a label says "FOUNDED" and the card behind it is white, the label must be a dark color.

## 7. Slide 1 — General (`#general`)

The event as a concept, independent of any year. Updated rarely.

### Required content (in this order)

1. **Hero background** — `{slug}-hero.png` as full-bleed background with overlay. Event H1 sits centered or left-aligned over the image.
2. **Intro paragraph** — 1–3 sentences over the hero overlay.
3. **Key facts strip** — 4 cards in a row: founding year, frequency, current edition, format size. Solid card background, dark text inside.
4. **History card** — 1 paragraph or short timeline.
5. **Format / rules card**.
6. **All-time top list** — winners, champions, or hosts. Each row uses `flag + name + link`. The flag image must match the country it labels.
7. **Records card**.
8. **Past editions table** — last 10+ editions. Year, host country (flag + link), winner country (flag + link).
9. **Notable moments** — 3–5 short bullets.
10. **Link to parent topic page** at the bottom.

Slide 1 has no countdown, no tickets, no schedule, no affiliate links. Those belong on Slide 2.

## 8. Slide 2 — Year (`#year`)

The specific edition currently displayed. By default this is the next upcoming edition. The user can switch to any of the last 5 editions.

### Required content (in this order)

1. **Edition header** — H2 with `{Event name} {year} in {city}`.
2. **Year switcher** — a horizontal control showing the last 5 editions plus the current/upcoming one. Each entry is a clickable button. The active year is highlighted. Clicking changes the data in Section 2 only.
3. **Fact box** — country (flag + link), city (link), venue, dates, status, format. Multiple countries: each rendered as flag + link.
4. **Countdown** — live ticking countdown to the start date. After the event, this shows "X days ago" and a countdown to the next edition.
5. **The 20 standard pre-event questions** — only the ones that apply. Each question is a small content block (a few sentences, a list, a table, or one visual). No walls of text.
6. **Add-to-calendar button** — generates `.ics` for the current edition.
7. **Save / Remind-me button** — uses shared JS to save to local storage.
8. **Sources and last-updated date** — at the bottom of the slider.

### The 20 standard pre-event questions

Include those that apply to this event type. Skip the rest.

1. When is the event?
2. Where is it held?
3. How do I get there?
4. Where should I stay?
5. How do I buy tickets?
6. What does it cost?
7. When do tickets go on sale?
8. What is the program/schedule?
9. Who is participating/performing?
10. What weather can I expect?
11. What should I pack?
12. Are there age limits or rules?
13. Is it safe to go?
14. Do I need a visa?
15. What else can I do nearby?
16. What language/currency is used?
17. What mistakes do first-timers make?
18. Can I watch on TV/streaming?
19. Is there official merch?
20. What happened last edition / what's new this year?

Examples of skipping:
- TV-only sports event (Super Bowl): skip 3, 4, 11, 14
- Local cultural holiday: skip 5, 7, 14
- Nature event: skip 5, 9
- Religious observance: skip 5, 19
- Trade fair: skip 11; emphasize 12

### Lifecycle — Section 2 transforms before/after the event

When the displayed edition is in the past, content swaps according to this table. **Sections never appear empty.**

| Before the event | After the event |
|---|---|
| Tickets & prices | Final results / winner (flag + link) |
| How to get there | Highlights — key moments, photos, video |
| Where to stay | Attendance figures and notable visitors |
| What to pack | Statistics from the event |
| Schedule / program | Actual program as played |
| Expected weather | Actual weather during the event |
| First-timer mistakes | Lessons / trivia from this edition |
| Countdown | "X days ago" + countdown to next edition |

Persistent items: fact box, source, last-updated date.

## 9. Slide 3 — Parts (`#parts`, optional)

Only include this section if the event has named distinct parts.

Two types of parts:
- **Time-based parts:** match, round, stage, semifinal, qualifier
- **Space-based parts:** tent, stage, course, venue, pavilion

Parts are rendered as **stacked sub-sections inside the slider** (vertical scroll within the panel, or a horizontal carousel if there are many comparable parts). **Primary parts are not tab widgets.** Compact in-card tabs are allowed only for closely comparable live subgroups inside a part, such as Group A / Group B upcoming fixtures. Each part has its own H3 heading and its own anchor.

### Required content per part

Time-based part:
1. H3 with part name (e.g. "Semi-final 1")
2. Date and time
3. Venue (city flag + link)
4. Participants (each as flag + link if country)
5. Before the part: odds, form, what to expect
6. After the part: result, key moments, stats

Space-based part:
1. H3 with venue/part name
2. Type, capacity, operator
3. Atmosphere / style description
4. Booking / access info
5. Schedule of what happens here

If the event has no parts, omit Section 3 entirely. The page then has two sliders.

## 10. Country Rendering — Always Correct Flag + Link

This is non-negotiable. Whenever a country appears anywhere on the page, render it as flag + name + link.

```html
<a class="country" href="/locations/europe/austria/">
  <img src="/assets/flags/austria.svg" alt="" width="20" height="14">
  Austria
</a>
```

### Mandatory pairing — the flag must match the country

The image, the country name, and the link must all reference the same country. This is the single most common mistake. Verify before generating:

- The `<img src>` filename ends in the same country name as the visible label and the link path.
- `argentina.svg` is only used next to "Argentina" with a link to `/locations/.../argentina/`.
- `brazil.svg` is only used next to "Brazil" with a link to `/locations/.../brazil/`.
- Never reuse a flag from one country for another. Never invent a flag path that does not exist.

If the correct flag SVG is not available at the expected path, omit the flag rather than show the wrong one. Do not substitute another country's flag.

### Other rules

- Plain-text country names are forbidden in tables, lists, fact boxes, and inline text.
- SVG flags. Alt is empty because the country name is the visible text.
- Link target is the canonical country page.
- The same pattern applies to cities (link to city page) where appropriate.
- The shared `.country` class in `events.css` controls appearance.

### Places this is often missed (and must be fixed)

- "All-time title leaders" rows
- "Past editions" tables (host AND winner columns)
- "Participants" lists in parts
- Fact box `Country` field
- "Notable moments" bullets that reference country names

## 11. Images Per Event

Every event has exactly two images. Both are required. Both must be generated if no real photo exists.

| Image | Filename | Size | Use |
|---|---|---|---|
| Hero | `{event-slug}-hero.png` | 1200×630 | Slide 1 background, Open Graph share image |
| Mini | `{event-slug}-mini.png` | 400×300 | Used by OTHER pages (topic, location, related cards) when linking to this event |

### Rules

- Both images use the same visual style and palette.
- The mini image is **never** used on the event's own page. It is only for other pages linking inward.
- Storage path: `/{topic-path}/events/img/{event-slug}-hero.png` and `.../{event-slug}-mini.png`.
- AI-generated images are acceptable. Avoid generic stock-photo feel.
- If a real photo becomes available later, replace the file at the same path. Linking pages update automatically.

## 12. Shared Assets

### `events.css`

One shared stylesheet for every event page. It defines:
- Scroll-snap container and full-viewport slider panels
- Hero with overlay text
- Year switcher
- Fact box
- Countdown
- Country chip (`.country` flag + link)
- Tables, lists, question blocks
- Save / calendar buttons
- Typography, colors, spacing

No inline styles. No per-page CSS files. Changing the look of the site means editing this one file.

### `events.js`

One shared script for every event page. It handles:
- Carousel navigation (translateX of the track, next/prev buttons, dots, keyboard, swipe)
- Countdown ticking
- Year switcher (re-rendering Slide 2 with selected edition's data)
- Save / remind functionality (local storage)
- Calendar `.ics` generation
- Language switcher
- Anchor link handling (jumping the carousel to a named slide)

No inline scripts. No per-page JS files.

## 13. Year Switcher — How It Works

Slide 2 includes a horizontal year switcher near the top:

```
[ 2022 ]  [ 2018 ]  [ 2014 ]  [ 2010 ]  [ 2006 ]  [ 2026 (current) ]
```

- Shows the current/upcoming edition plus the last 5 past editions.
- The active edition is visually highlighted.
- Clicking another edition re-renders Slide 2 with that edition's data (fact box, results or planning info, lifecycle state).
- Slide 1 and Slide 3 do not change.
- Implementation: data for all displayable editions is embedded in the page (JSON in a script tag) and rendered by `events.js`. No additional page loads, no URL changes.

## 14. Content Rules

### Accuracy
- Never invent facts, dates, names, or quotes.
- If data is missing, write "TBC" or omit the item.
- Cite sources where claims could be challenged.
- Visible "Last updated: {date}" on every page.
- **Verify country–flag pairing** (see Section 9). The single most common content error.

### Voice
- Specific, never generic. "Wiener Stadthalle seats 16,000" beats "a large arena."
- No filler ("It's worth noting", "In conclusion", "This exciting event").
- An opinion sentence is welcome where helpful.

### Structure
- Lead with the answer, then context.
- Short paragraphs.
- Tables, lists, fact boxes — they scan fast.
- Literal H2 and H3 headings.

## 15. Forbidden Patterns

These are common implementation mistakes. Do not do them.

- Vertical scroll of stacked sections instead of horizontal carousel
- Slides that do not fill the full viewport (100vw × 100vh)
- **Duplicate slide navigation in the top bar** (General/Year/Parts links). Slide nav lives at the bottom only.
- Topic pill or page title in the top bar
- Sidebar / `<aside>` / two-column layout
- Tab widgets for parts
- Country names rendered as plain text
- Wrong flag next to a country name (e.g. Argentina flag next to "Brazil")
- White or light text on white card background
- Light gray labels on white card background (insufficient contrast)
- Inline styles or inline scripts
- Per-page CSS or JS files
- Year embedded in the URL
- Separate URLs per part
- Hero image overlaid with the mini image as a thumbnail
- Action buttons stacked at the top of the page outside of slides
- Decorative elements that do not appear in this spec

If a feature is not described in this document, do not add it. Ask first.

## 16. Generation Workflow

When generating or updating an event page:

1. Identify event type (sport, festival, cultural, religious, nature, trade, awareness).
2. Determine taxonomy parents (topic, country, city, venue).
3. Decide if Slide 3 applies (does the event have named distinct parts?).
4. Select which of the 20 questions apply to Slide 2.
5. Determine lifecycle state of the displayed edition (upcoming / past).
6. Generate the carousel skeleton with 2 or 3 slides, each `100vw × 100vh`.
7. Embed JSON data for the last 5 editions plus the current one.
8. Apply the country rendering pattern everywhere a country appears.
9. **Verify each flag matches the country it labels** (filename, label, link all reference the same country).
10. Verify text/background contrast in every card.
11. Verify two images exist at the correct paths.
12. Verify no slide is empty.
13. Verify only `events.css` and `events.js` are linked.

## 17. The Test

Before considering a page done, confirm all of these:

- [ ] Page is a horizontal carousel of 2 or 3 slides
- [ ] Each slide fills 100vw × 100vh
- [ ] Next/Previous buttons slide between slides with smooth animation
- [ ] No vertical-stacked layout, no sidebar, no primary-part tabs
- [ ] Every country appears as flag + name + link
- [ ] Every flag image matches the country it labels
- [ ] All text is readable against its background (no white-on-white)
- [ ] Year switcher on Slide 2 with last 5 editions
- [ ] Shared `events.css` + `events.js` only
- [ ] Hero (1200×630) and mini (400×300) images exist
- [ ] Countdown ticks on Slide 2
- [ ] No empty slides
- [ ] Last-updated date visible

If any box is unchecked, the page is not ready.

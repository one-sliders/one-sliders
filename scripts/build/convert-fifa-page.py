"""Convert FIFA World Cup page to Masters-style onepage layout."""
import re

SRC = 'C:/Users/AndersEriksson/3DF/OneSlider/content/categories/sport/football/events/fifa-world-cup.html'
DST = 'C:/Users/AndersEriksson/3DF/OneSlider/Templates/test/content/categories/sport/football/events/fifa-world-cup.html'

with open(SRC, 'r', encoding='utf-8') as f:
    content = f.read()

year_data_m = re.search(r'<script type="application/json" id="event-year-data">(.*?)</script>', content, re.DOTALL)
year_data_json = year_data_m.group(1) if year_data_m else '{}'

schedule_m = re.search(r'<script type="application/json" id="wc2026-schedule">(.*?)</script>', content, re.DOTALL)
schedule_json = schedule_m.group(1) if schedule_m else '{}'

jsonld_m = re.search(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
jsonld = jsonld_m.group(1) if jsonld_m else '{}'

HTML = r"""<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <link rel="stylesheet" href="/assets/css2/colors.css">
  <link rel="stylesheet" href="/assets/css2/shapes.css">
  <link rel="stylesheet" href="/assets/css2/events.css">
  <link rel="preload" as="image" href="/content/categories/sport/football/events/img/fifa-world-cup-hero-1200.webp" type="image/webp">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <script defer src="/assets/js/events.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FIFA World Cup 2026 - Dates, Schedule &amp; Results</title>
  <meta name="description" content="FIFA World Cup 2026: dates, schedule, host cities, teams and where to stay.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://one-sliders.com/content/categories/sport/football/events/fifa-world-cup.html">
  <meta name="content-language" content="en">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta property="og:type" content="article">
  <meta property="og:title" content="FIFA World Cup 2026 - Dates, Schedule &amp; Results">
  <meta property="og:description" content="FIFA World Cup 2026: dates, schedule, host cities, teams and where to stay.">
  <meta property="og:image" content="https://one-sliders.com/content/categories/sport/football/events/img/fifa-world-cup-hero.png">
  <meta property="og:url" content="https://one-sliders.com/content/categories/sport/football/events/fifa-world-cup.html">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="FIFA World Cup 2026 - Dates, Schedule &amp; Results">
  <meta name="twitter:description" content="FIFA World Cup 2026: dates, schedule, host cities, teams and where to stay.">
  <meta name="twitter:image" content="https://one-sliders.com/content/categories/sport/football/events/img/fifa-world-cup-hero.png">
  <link rel="alternate" hreflang="en" href="https://one-sliders.com/content/categories/sport/football/events/fifa-world-cup.html">
  <link rel="alternate" hreflang="x-default" href="https://one-sliders.com/content/categories/sport/football/events/fifa-world-cup.html">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <meta name="theme-color" content="#0d2137">
  <script type="application/ld+json">JSONLD_PLACEHOLDER</script>
  <script type="application/json" id="event-year-data">YEARDATA_PLACEHOLDER</script>
<style>
/* CTA button -- sport primary colour */
.football .stay-check-btn{background:var(--page-theme);box-shadow:0 12px 26px color-mix(in srgb,var(--page-theme) 30%,transparent)}
.football .stay-check-btn:hover{box-shadow:0 16px 30px color-mix(in srgb,var(--page-theme) 38%,transparent)}
/* Overview tab */
.ov-header{background:var(--page-theme);color:var(--os-surface);border-radius:8px;padding:10px 12px;margin-bottom:8px}
.ov-dates{font-size:14px;font-weight:800;letter-spacing:-.01em;line-height:1.1}
.ov-hosts{font-size:10px;opacity:.72;margin-top:2px}
.ov-stats{display:flex;border:1px solid var(--page-line);border-radius:8px;overflow:hidden;margin-bottom:10px}
.ov-stat{flex:1;text-align:center;padding:7px 4px;border-right:1px solid var(--page-line)}
.ov-stat:last-child{border-right:none}
.ov-stat strong{display:block;font-size:13px;font-weight:800;color:var(--page-ink);line-height:1}
.ov-stat span{font-size:8.5px;color:var(--page-muted);text-transform:uppercase;letter-spacing:.04em}
.ov-intro{font-size:11.5px;color:var(--page-muted);line-height:1.5;margin:0 0 10px}
.ov-format{display:flex;align-items:center;gap:3px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}
.ov-stage{background:var(--page-soft);border:1px solid var(--page-line);border-radius:5px;padding:4px 7px;font-size:9.5px;font-weight:700;color:var(--page-ink);text-align:center;white-space:nowrap;line-height:1.2;flex-shrink:0}
.ov-stage span{display:block;font-size:8px;font-weight:400;color:var(--page-muted)}
.ov-stage--final{background:var(--page-theme);color:var(--os-surface);border-color:var(--page-theme)}
.ov-stage--final span{color:color-mix(in srgb,var(--os-surface) 70%,transparent)}
.ov-arr{font-size:10px;color:var(--page-line);flex-shrink:0}
.ov-section-hd{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--page-muted);margin:10px 0 5px}
.ov-venues-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px}
.ov-country-card{border:1px solid var(--page-line);border-radius:7px;overflow:hidden}
.ov-country-hd{display:flex;align-items:center;gap:5px;background:var(--page-soft);padding:4px 7px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--page-ink)}
.ov-country-hd img{width:16px;height:11px;object-fit:cover;border-radius:1px;border:.5px solid var(--page-line)}
.ov-venue-item{display:block;font-size:10px;padding:2px 7px;border-bottom:1px solid var(--page-soft);color:var(--page-ink)}
.ov-venue-item:last-child{border-bottom:none}
.ov-venue-item em{font-style:normal;font-size:8.5px;color:var(--page-muted)}
/* Matches tab */
.mp-tz{font-size:10px;color:var(--page-muted);margin:0 0 8px}
.mp-ph{display:flex;align-items:center;gap:6px;margin:14px 0 6px}
.mp-ph:first-child{margin-top:0}
.mp-ph-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--os-surface);background:var(--page-theme);padding:2px 7px;border-radius:3px;white-space:nowrap}
.mp-ph-line{flex:1;height:1px;background:var(--page-line)}
.mp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;margin-bottom:4px}
.mp-day{border:1px solid var(--page-line);border-radius:8px;overflow:hidden;background:var(--os-surface);box-shadow:0 2px 8px color-mix(in srgb,var(--page-ink) 6%,transparent)}
.mp-day-hd{background:var(--page-theme);color:var(--os-surface);font-size:10px;font-weight:700;padding:5px 10px}
.mp-day-body{padding:3px 6px 5px}
.mp-m{display:flex;align-items:center;gap:4px;padding:2px 0;min-height:22px;border-bottom:1px solid var(--page-soft)}
.mp-m:last-child{border-bottom:none}
.mp-t{width:32px;flex-shrink:0;font-size:10px;font-weight:700;color:var(--page-accent);font-variant-numeric:tabular-nums}
.mp-t.mp-t--blank{opacity:0;pointer-events:none}
.mp-h,.mp-a{display:flex;align-items:center;gap:3px;min-width:0;flex:1}
.mp-h img,.mp-a img{width:16px;height:11px;object-fit:cover;border:.5px solid var(--page-line);border-radius:1px;flex-shrink:0}
.mp-h span,.mp-a span{font-size:11px;font-weight:600;color:var(--page-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mp-vs{font-size:9px;color:var(--page-line);flex-shrink:0;padding:0 2px}
.mp-b{flex-shrink:0;font-size:8px;font-weight:700;color:var(--page-muted);white-space:nowrap;margin-left:auto;padding-left:4px}
.mp-unk{color:var(--page-muted);font-style:italic}
.mp-flag-ph{width:16px;height:11px;background:var(--page-soft);border-radius:1px;flex-shrink:0;border:.5px solid var(--page-line)}
/* Teams tab */
.gr-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px}
.gr-card{border:1px solid var(--page-line);border-radius:8px;overflow:hidden;box-shadow:0 2px 8px color-mix(in srgb,var(--page-ink) 6%,transparent)}
.gr-hd{background:var(--page-theme);color:var(--os-surface);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;padding:4px 8px}
.gr-team{display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid var(--page-soft);font-size:11px;font-weight:600;color:var(--page-ink)}
.gr-team:last-child{border-bottom:none}
.gr-team img{width:18px;height:12px;object-fit:cover;border-radius:1px;border:.5px solid var(--page-line);flex-shrink:0}
.gr-flag-ph{width:18px;height:12px;background:var(--page-soft);border-radius:1px;border:.5px solid var(--page-line);flex-shrink:0}
.gr-r32-row{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.gr-chip{display:inline-flex;align-items:center;gap:4px;background:var(--page-soft);border:1px solid var(--page-line);border-radius:12px;padding:2px 7px 2px 4px;font-size:10.5px;font-weight:600;color:var(--page-ink)}
.gr-chip img{width:14px;height:10px;object-fit:cover;border-radius:1px;border:.5px solid var(--page-line)}
.gr-chip .gr-flag-ph{width:14px;height:10px}
.gr-note{font-size:10px;color:var(--page-muted);font-style:italic;margin-top:4px}
/* History tab */
.mp-wtable{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}
.mp-wtable th{text-align:left;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--page-muted);padding:4px 6px;border-bottom:2px solid var(--page-line)}
.mp-wtable td{padding:5px 6px;border-bottom:1px solid var(--page-soft);vertical-align:middle;color:var(--page-ink)}
.mp-wtable tr:last-child td{border-bottom:none}
.mp-w-winner{display:flex;align-items:center;gap:5px;font-weight:700}
.mp-w-winner img{width:18px;height:12px;object-fit:cover;border-radius:1px;border:.5px solid var(--page-line)}
/* Visit sub-nav */
.stay-sub-r{display:none}
.stay-nav-header{margin-bottom:14px}
.stay-nav-header .stay-section-label{color:var(--page-accent);font-size:11px;font-weight:700;letter-spacing:.08em;margin:0 0 2px}
.stay-nav-header .stay-nav-title{margin:0 0 14px;font-size:clamp(15px,1.5vw,19px);font-weight:800;color:var(--page-ink)}
.stay-nav-layout{display:flex;gap:14px;align-items:start}
.stay-sidenav{display:flex;flex-direction:column;gap:5px;width:140px;flex-shrink:0}
.stay-sidenav__item{display:block;padding:9px 13px;font-size:13px;font-weight:600;color:var(--page-ink);background:var(--os-surface);border:1px solid var(--page-line);border-radius:8px;cursor:pointer;transition:background .1s,color .1s;user-select:none}
.stay-sidenav__item:hover{background:var(--page-soft)}
#ss-overview:checked~.stay-sidenav label[for="ss-overview"],
#ss-areas:checked~.stay-sidenav label[for="ss-areas"],
#ss-airports:checked~.stay-sidenav label[for="ss-airports"],
#ss-tips:checked~.stay-sidenav label[for="ss-tips"],
#ss-booking:checked~.stay-sidenav label[for="ss-booking"]{color:var(--os-surface);background:var(--page-theme);border-color:var(--page-theme)}
.stay-subcontent{flex:1;min-width:0}
.stay-subpanel{display:none}
#ss-overview:checked~.stay-subcontent .stay-subpanel--overview,
#ss-areas:checked~.stay-subcontent .stay-subpanel--areas,
#ss-airports:checked~.stay-subcontent .stay-subpanel--airports,
#ss-tips:checked~.stay-subcontent .stay-subpanel--tips,
#ss-booking:checked~.stay-subcontent .stay-subpanel--booking{display:block}
.stay-subpanel h3{margin:0 0 12px;font-size:clamp(15px,1.5vw,19px);font-weight:800;color:var(--page-ink)}
.stay-subpanel p{margin:0 0 12px;font-size:13px;line-height:1.55;color:var(--page-muted)}
.stay-subpanel p strong{color:var(--page-ink)}
.stay-focus-card{background:var(--page-soft);border:1px solid var(--page-line);border-radius:10px;padding:13px 15px;margin-bottom:14px}
.stay-focus-card__label{font-size:11px;font-weight:700;color:var(--page-muted);margin:0 0 5px}
.stay-focus-card__text{font-size:13px;font-weight:700;color:var(--page-ink);margin:0;line-height:1.4}
.stay-area-list{list-style:none;padding:0;margin:0 0 14px;display:flex;flex-direction:column;gap:6px}
.stay-area-list li{font-size:13px;padding:7px 12px;background:var(--page-soft);border:1px solid var(--page-line);border-radius:8px;color:var(--page-ink)}
.stay-area-list li span{display:block;font-size:11px;color:var(--page-muted);margin-top:1px}
.stay-airport-row{display:flex;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px solid var(--page-soft);font-size:13px;color:var(--page-ink)}
.stay-airport-row:last-child{border-bottom:none}
.stay-airport-code{font-weight:800;font-size:12px;color:var(--page-accent);min-width:34px}
.stay-airport-city{color:var(--page-muted);font-size:12px}
@media(max-width:768px){.ov-venues-grid{grid-template-columns:1fr}.gr-grid{grid-template-columns:1fr}}
@media(max-width:480px){.ov-stat span{font-size:7.5px}.ov-format{gap:2px}.ov-stage{padding:3px 5px;font-size:8.5px}.mp-grid{grid-template-columns:1fr}}
</style>
</head>
<body data-os-category="sport" data-cat="sport" class="onepage football onepage--fifa-world-cup">

  <nav class="top-menu" aria-label="Site navigation">
    <a class="os-brand" href="/" aria-label="Home"><img class="os-brand__logo" src="/assets/icons/one-sliders-icon.svg" alt="" width="22" height="22" aria-hidden="true"><span class="os-brand__text">OneSliders</span></a>
    <a class="nav-icon" href="/content/events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <a class="nav-back" href="/content/categories/sport/football.html" aria-label="Back to Football"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>Football</span></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"></div></details>
  </nav>

  <main class="page-shell page-content page-frame">
    <div class="layout-columns">

      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="/content/categories/sport/football/events/img/fifa-world-cup-hero-400.webp 400w, /content/categories/sport/football/events/img/fifa-world-cup-hero-768.webp 768w, /content/categories/sport/football/events/img/fifa-world-cup-hero-1200.webp 1200w" sizes="(max-width: 980px) 100vw, 40vw" type="image/webp">
            <img src="/content/categories/sport/football/events/img/fifa-world-cup-hero.png" alt="FIFA World Cup" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row">
            <h1 class="hero__title">FIFA World Cup 2026</h1>
          </div>
          <section class="stay-booking-panel hero-stay-booking" id="wc-stay-booking" aria-label="Book hotels for FIFA World Cup 2026">
            <div class="stay-booking-panel__header">
              <p class="stay-section-label">
                <span class="booking-symbols booking-symbols--small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M4 21V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13"></path><path d="M3 21h18"></path><path d="M8 10h1"></path><path d="M12 10h1"></path><path d="M18 21v-6h1a2 2 0 0 1 2 2v4"></path></svg>
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M10.5 4.5 13 12l6.5 2a1.5 1.5 0 0 1 .25 2.78l-1.1.55a2 2 0 0 1-1.75.02L12 15.5 8.5 20H6l2-6-5-3V8.5l5 1.5 1-5.5h1.5Z"></path></svg>
                </span>
                <span>BOOK HOTELS &amp; FLIGHTS</span>
              </p>
              <h2 class="stay-section-title">Book stays for FIFA World Cup 2026</h2>
            </div>
            <div class="stay-form-row">
              <div class="stay-form-field">
                <label class="stay-field-label" for="wc-checkin">CHECK-IN</label>
                <input type="date" id="wc-checkin" class="stay-field-input" value="2026-07-17">
              </div>
              <div class="stay-form-field">
                <label class="stay-field-label" for="wc-checkout">CHECK-OUT</label>
                <input type="date" id="wc-checkout" class="stay-field-input" value="2026-07-20">
              </div>
            </div>
            <div class="stay-form-row">
              <div class="stay-form-field">
                <label class="stay-field-label" for="wc-guests">GUESTS</label>
                <input type="number" id="wc-guests" class="stay-field-input" value="2" min="1" max="10">
              </div>
              <div class="stay-form-field">
                <label class="stay-field-label" for="wc-rooms">ROOMS</label>
                <input type="number" id="wc-rooms" class="stay-field-input" value="1" min="1" max="5">
              </div>
            </div>
            <p class="stay-field-label stay-area-label">HOST CITY</p>
            <div class="stay-area-pills">
              <label class="stay-area-pill"><input type="radio" name="wc-city" value="New+York" checked><span>New York</span></label>
              <label class="stay-area-pill"><input type="radio" name="wc-city" value="Los+Angeles"><span>Los Angeles</span></label>
              <label class="stay-area-pill"><input type="radio" name="wc-city" value="Dallas"><span>Dallas</span></label>
              <label class="stay-area-pill"><input type="radio" name="wc-city" value="Mexico+City"><span>Mexico City</span></label>
              <label class="stay-area-pill"><input type="radio" name="wc-city" value="Toronto"><span>Toronto</span></label>
            </div>
            <a class="stay-check-btn" id="wc-booking-btn" href="https://www.kqzyfj.com/click-101771061-15735418?url=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3Fss%3DNew%2BYork%26checkin%3D2026-07-17%26checkout%3D2026-07-20%26group_adults%3D2%26no_rooms%3D1" target="_blank" rel="nofollow sponsored noopener">Check hotel prices</a>
            <p class="stay-booking-note">OneSliders may earn a commission if you book through Booking.com.</p>
          </section>
        </div>
      </div>

      <div class="layout__b">
        <div class="event-tabs">
          <input type="radio" name="event-tab" id="tab-when" checked>
          <input type="radio" name="event-tab" id="tab-matches">
          <input type="radio" name="event-tab" id="tab-teams">
          <input type="radio" name="event-tab" id="tab-history">
          <input type="radio" name="event-tab" id="tab-visit">

          <div class="event-tablist" role="tablist">
            <label class="event-tab-label" for="tab-when">Overview</label>
            <label class="event-tab-label" for="tab-matches">Matches</label>
            <label class="event-tab-label" for="tab-teams">Teams</label>
            <label class="event-tab-label" for="tab-history">History</label>
            <label class="event-tab-label" for="tab-visit">Visit</label>
          </div>

          <div class="event-tab-panels">

            <div class="event-tab-panel" id="panel-when">
              <div class="event-panel-inner">
                <div class="ov-header">
                  <div class="ov-dates">11 Jun &#x2013; 19 Jul 2026</div>
                  <div class="ov-hosts">Canada &middot; Mexico &middot; United States</div>
                </div>
                <div class="ov-stats">
                  <div class="ov-stat"><strong>48</strong><span>Teams</span></div>
                  <div class="ov-stat"><strong>104</strong><span>Matches</span></div>
                  <div class="ov-stat"><strong>16</strong><span>Cities</span></div>
                  <div class="ov-stat"><strong>$1bn+</strong><span>Prize pool</span></div>
                </div>
                <p class="ov-intro">First edition with 48 teams &#x2014; 16 more than 2022. Argentina defend the title. Final at MetLife Stadium, New Jersey.</p>
                <div class="ov-format">
                  <div class="ov-stage">12<br><span>Groups</span></div>
                  <div class="ov-arr">&#x203A;</div>
                  <div class="ov-stage">R32</div>
                  <div class="ov-arr">&#x203A;</div>
                  <div class="ov-stage">R16</div>
                  <div class="ov-arr">&#x203A;</div>
                  <div class="ov-stage">QF</div>
                  <div class="ov-arr">&#x203A;</div>
                  <div class="ov-stage">SF</div>
                  <div class="ov-arr">&#x203A;</div>
                  <div class="ov-stage ov-stage--final">Final<br><span>19 Jul</span></div>
                </div>
                <p class="ov-section-hd">Venues</p>
                <div class="ov-venues-grid">
                  <div class="ov-country-card">
                    <div class="ov-country-hd"><img src="/content/locations/north-america/usa/img/flag.svg" alt="USA" width="16" height="11" loading="lazy"> USA &#x2014; 11</div>
                    <span class="ov-venue-item">MetLife, NJ <em>&#x2014; Final</em></span>
                    <span class="ov-venue-item">SoFi, Los Angeles</span>
                    <span class="ov-venue-item">AT&amp;T, Dallas</span>
                    <span class="ov-venue-item">Levi's, San Francisco</span>
                    <span class="ov-venue-item">Mercedes-Benz, Atlanta</span>
                    <span class="ov-venue-item">Gillette, Boston</span>
                    <span class="ov-venue-item">Lincoln Financial, Philadelphia</span>
                    <span class="ov-venue-item">NRG, Houston</span>
                    <span class="ov-venue-item">Q2, Austin</span>
                    <span class="ov-venue-item">Arrowhead, Kansas City</span>
                    <span class="ov-venue-item">Empower Field, Denver</span>
                  </div>
                  <div class="ov-country-card">
                    <div class="ov-country-hd"><img src="/content/locations/north-america/mexico/img/flag.svg" alt="Mexico" width="16" height="11" loading="lazy"> Mexico &#x2014; 3</div>
                    <span class="ov-venue-item">Estadio Azteca <em>Mexico City</em></span>
                    <span class="ov-venue-item">Estadio BBVA <em>Monterrey</em></span>
                    <span class="ov-venue-item">Estadio Akron <em>Guadalajara</em></span>
                  </div>
                  <div class="ov-country-card">
                    <div class="ov-country-hd"><img src="/content/locations/north-america/canada/img/flag.svg" alt="Canada" width="16" height="11" loading="lazy"> Canada &#x2014; 2</div>
                    <span class="ov-venue-item">BMO Field <em>Toronto</em></span>
                    <span class="ov-venue-item">BC Place <em>Vancouver</em></span>
                  </div>
                </div>
                <p class="ov-section-hd">All-time title leaders</p>
                <ol class="event-key-facts">
                  <li class="event-fact"><span>Brazil</span><strong>5 titles (1958, 1962, 1970, 1994, 2002)</strong></li>
                  <li class="event-fact"><span>Italy</span><strong>4 titles (1934, 1938, 1982, 2006)</strong></li>
                  <li class="event-fact"><span>Germany</span><strong>4 titles (1954, 1974, 1990, 2014)</strong></li>
                  <li class="event-fact"><span>Argentina</span><strong>3 titles &#x2014; defending champions</strong></li>
                </ol>
              </div>
            </div>

            <div class="event-tab-panel" id="panel-matches">
              <div class="event-panel-inner">
                <p class="ov-intro">Group stage: 11&#x2013;26 June 2026. R32: 28 June&#x2013;4 July. R16: 4&#x2013;8 July. QF: 9&#x2013;12 July. SF: 14&#x2013;15 July. <strong>Final: 19 July 2026</strong> at MetLife Stadium, NJ.</p>
                <p class="mp-tz" id="mp-tz"></p>
                <div id="mp-mount"></div>
              </div>
            </div>

            <div class="event-tab-panel" id="panel-teams">
              <div class="event-panel-inner">
                <p class="ov-section-hd">Confirmed groups (G &#x2013; L)</p>
                <div class="gr-grid">
                  <div class="gr-card">
                    <div class="gr-hd">Group G</div>
                    <div class="gr-team"><img src="/content/locations/africa/egypt/img/flag.svg" alt="Egypt" width="18" height="12" loading="lazy">Egypt</div>
                    <div class="gr-team"><img src="/content/locations/asia/iran/img/flag.svg" alt="Iran" width="18" height="12" loading="lazy">Iran</div>
                    <div class="gr-team"><img src="/content/locations/oceania/new-zealand/img/flag.svg" alt="New Zealand" width="18" height="12" loading="lazy">New Zealand</div>
                    <div class="gr-team"><img src="/content/locations/europe/belgium/img/flag.svg" alt="Belgium" width="18" height="12" loading="lazy">Belgium</div>
                  </div>
                  <div class="gr-card">
                    <div class="gr-hd">Group H</div>
                    <div class="gr-team"><img src="/content/locations/south-america/uruguay/img/flag.svg" alt="Uruguay" width="18" height="12" loading="lazy">Uruguay</div>
                    <div class="gr-team"><img src="/content/locations/europe/spain/img/flag.svg" alt="Spain" width="18" height="12" loading="lazy">Spain</div>
                    <div class="gr-team"><span class="gr-flag-ph"></span>Cape Verde</div>
                    <div class="gr-team"><img src="/content/locations/asia/saudi-arabia/img/flag.svg" alt="Saudi Arabia" width="18" height="12" loading="lazy">Saudi Arabia</div>
                  </div>
                  <div class="gr-card">
                    <div class="gr-hd">Group J</div>
                    <div class="gr-team"><img src="/content/locations/asia/jordan/img/flag.svg" alt="Jordan" width="18" height="12" loading="lazy">Jordan</div>
                    <div class="gr-team"><img src="/content/locations/south-america/argentina/img/flag.svg" alt="Argentina" width="18" height="12" loading="lazy">Argentina</div>
                    <div class="gr-team"><img src="/content/locations/africa/algeria/img/flag.svg" alt="Algeria" width="18" height="12" loading="lazy">Algeria</div>
                    <div class="gr-team"><img src="/content/locations/europe/austria/img/flag.svg" alt="Austria" width="18" height="12" loading="lazy">Austria</div>
                  </div>
                  <div class="gr-card">
                    <div class="gr-hd">Group K</div>
                    <div class="gr-team"><span class="gr-flag-ph"></span>Congo DR</div>
                    <div class="gr-team"><span class="gr-flag-ph"></span>Uzbekistan</div>
                    <div class="gr-team"><img src="/content/locations/south-america/colombia/img/flag.svg" alt="Colombia" width="18" height="12" loading="lazy">Colombia</div>
                    <div class="gr-team"><img src="/content/locations/europe/portugal/img/flag.svg" alt="Portugal" width="18" height="12" loading="lazy">Portugal</div>
                  </div>
                  <div class="gr-card">
                    <div class="gr-hd">Group L</div>
                    <div class="gr-team"><img src="/content/locations/north-america/panama/img/flag.svg" alt="Panama" width="18" height="12" loading="lazy">Panama</div>
                    <div class="gr-team"><img src="/content/locations/europe/england/img/flag.svg" alt="England" width="18" height="12" loading="lazy">England</div>
                    <div class="gr-team"><img src="/content/locations/europe/croatia/img/flag.svg" alt="Croatia" width="18" height="12" loading="lazy">Croatia</div>
                    <div class="gr-team"><img src="/content/locations/africa/ghana/img/flag.svg" alt="Ghana" width="18" height="12" loading="lazy">Ghana</div>
                  </div>
                </div>
                <p class="ov-section-hd">Other R32 qualifiers</p>
                <div class="gr-r32-row">
                  <span class="gr-chip"><img src="/content/locations/europe/germany/img/flag.svg" alt="" width="14" height="10" loading="lazy">Germany</span>
                  <span class="gr-chip"><img src="/content/locations/europe/france/img/flag.svg" alt="" width="14" height="10" loading="lazy">France</span>
                  <span class="gr-chip"><img src="/content/locations/europe/netherlands/img/flag.svg" alt="" width="14" height="10" loading="lazy">Netherlands</span>
                  <span class="gr-chip"><img src="/content/locations/europe/switzerland/img/flag.svg" alt="" width="14" height="10" loading="lazy">Switzerland</span>
                  <span class="gr-chip"><img src="/content/locations/europe/norway/img/flag.svg" alt="" width="14" height="10" loading="lazy">Norway</span>
                  <span class="gr-chip"><img src="/content/locations/europe/sweden/img/flag.svg" alt="" width="14" height="10" loading="lazy">Sweden</span>
                  <span class="gr-chip"><img src="/content/locations/europe/bosnia/img/flag.svg" alt="" width="14" height="10" loading="lazy">Bosnia-Herz.</span>
                  <span class="gr-chip"><img src="/content/locations/south-america/brazil/img/flag.svg" alt="" width="14" height="10" loading="lazy">Brazil</span>
                  <span class="gr-chip"><img src="/content/locations/south-america/paraguay/img/flag.svg" alt="" width="14" height="10" loading="lazy">Paraguay</span>
                  <span class="gr-chip"><img src="/content/locations/north-america/usa/img/flag.svg" alt="" width="14" height="10" loading="lazy">USA</span>
                  <span class="gr-chip"><img src="/content/locations/north-america/mexico/img/flag.svg" alt="" width="14" height="10" loading="lazy">Mexico</span>
                  <span class="gr-chip"><img src="/content/locations/north-america/canada/img/flag.svg" alt="" width="14" height="10" loading="lazy">Canada</span>
                  <span class="gr-chip"><img src="/content/locations/africa/south-africa/img/flag.svg" alt="" width="14" height="10" loading="lazy">South Africa</span>
                  <span class="gr-chip"><img src="/content/locations/africa/morocco/img/flag.svg" alt="" width="14" height="10" loading="lazy">Morocco</span>
                  <span class="gr-chip"><img src="/content/locations/africa/ivory-coast/img/flag.svg" alt="" width="14" height="10" loading="lazy">Ivory Coast</span>
                  <span class="gr-chip"><span class="gr-flag-ph"></span>Cape Verde</span>
                  <span class="gr-chip"><img src="/content/locations/asia/japan/img/flag.svg" alt="" width="14" height="10" loading="lazy">Japan</span>
                  <span class="gr-chip"><img src="/content/locations/oceania/australia/img/flag.svg" alt="" width="14" height="10" loading="lazy">Australia</span>
                </div>
                <p class="gr-note">Groups A&#x2013;F played 11&#x2013;26 June; full group assignments not available in this data view. 48 teams across 12 groups.</p>
              </div>
            </div>

            <div class="event-tab-panel" id="panel-history">
              <div class="event-panel-inner">
                <div id="wc-winners-mount"></div>
              </div>
            </div>

            <div class="event-tab-panel" id="panel-visit">
              <div class="event-panel-inner">
                <div class="stay-nav-header">
                  <p class="stay-section-label">STAY</p>
                  <p class="stay-nav-title">Stay for FIFA World Cup 2026</p>
                </div>
                <div class="stay-nav-layout">
                  <input type="radio" name="stay-sub" id="ss-overview" class="stay-sub-r" checked>
                  <input type="radio" name="stay-sub" id="ss-areas" class="stay-sub-r">
                  <input type="radio" name="stay-sub" id="ss-airports" class="stay-sub-r">
                  <input type="radio" name="stay-sub" id="ss-tips" class="stay-sub-r">
                  <input type="radio" name="stay-sub" id="ss-booking" class="stay-sub-r">
                  <div class="stay-sidenav">
                    <label class="stay-sidenav__item" for="ss-overview">Overview</label>
                    <label class="stay-sidenav__item" for="ss-areas">Areas</label>
                    <label class="stay-sidenav__item" for="ss-airports">Airports</label>
                    <label class="stay-sidenav__item" for="ss-tips">Tips</label>
                    <label class="stay-sidenav__item" for="ss-booking">Booking</label>
                  </div>
                  <div class="stay-subcontent">
                    <div class="stay-subpanel stay-subpanel--overview">
                      <h3>Stay Overview</h3>
                      <div class="stay-focus-card">
                        <p class="stay-focus-card__label">Planning focus</p>
                        <p class="stay-focus-card__text">Host city, proximity to stadium, transport links and early booking &#x2014; demand peaks for match weeks.</p>
                      </div>
                      <p>The 2026 FIFA World Cup spans <strong>16 host cities</strong> across Canada, Mexico and the United States. The final is at MetLife Stadium, East Rutherford NJ. Start by choosing your match city, then compare hotel areas by distance to the stadium and transport options.</p>
                      <ol class="event-key-facts">
                        <li class="event-fact"><span>Final venue</span><strong>MetLife Stadium, NJ</strong></li>
                        <li class="event-fact"><span>Host countries</span><strong>USA &middot; Canada &middot; Mexico</strong></li>
                        <li class="event-fact"><span>Host cities</span><strong>16</strong></li>
                        <li class="event-fact"><span>Final date</span><strong>19 Jul 2026</strong></li>
                      </ol>
                    </div>
                    <div class="stay-subpanel stay-subpanel--areas">
                      <h3>Stay Areas</h3>
                      <p>Hotels near each host stadium:</p>
                      <ul class="stay-area-list">
                        <li>East Rutherford / Meadowlands<span>Final &#x2014; MetLife Stadium, NJ</span></li>
                        <li>Inglewood / LAX corridor<span>SoFi Stadium, Los Angeles</span></li>
                        <li>Frisco / Uptown Dallas<span>AT&amp;T Stadium, Dallas</span></li>
                        <li>Santa Clara / San Jos&#xe9;<span>Levi's Stadium, San Francisco Bay</span></li>
                        <li>Downtown Atlanta<span>Mercedes-Benz Stadium</span></li>
                        <li>Foxborough / Boston South<span>Gillette Stadium, Boston</span></li>
                        <li>South Philadelphia<span>Lincoln Financial Field, Philadelphia</span></li>
                        <li>Downtown Houston<span>NRG Stadium</span></li>
                        <li>Downtown Kansas City<span>Arrowhead Stadium</span></li>
                        <li>Downtown Denver<span>Empower Field, Denver</span></li>
                        <li>Santa Fe / Roma Norte<span>Estadio Azteca, Mexico City</span></li>
                        <li>Centro / San Pedro<span>Estadio BBVA, Monterrey</span></li>
                        <li>Zapopan<span>Estadio Akron, Guadalajara</span></li>
                        <li>Downtown Toronto<span>BMO Field</span></li>
                        <li>Downtown Vancouver<span>BC Place</span></li>
                      </ul>
                    </div>
                    <div class="stay-subpanel stay-subpanel--airports">
                      <h3>Airports</h3>
                      <p>Nearest international airports per host city:</p>
                      <div class="stay-airport-row"><span class="stay-airport-code">JFK/EWR</span><strong>New York</strong><span class="stay-airport-city">Final (MetLife)</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">LAX</span><strong>Los Angeles</strong><span class="stay-airport-city">SoFi Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">DFW</span><strong>Dallas</strong><span class="stay-airport-city">AT&amp;T Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">SFO</span><strong>San Francisco</strong><span class="stay-airport-city">Levi's Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">ATL</span><strong>Atlanta</strong><span class="stay-airport-city">Mercedes-Benz Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">BOS</span><strong>Boston</strong><span class="stay-airport-city">Gillette Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">PHL</span><strong>Philadelphia</strong><span class="stay-airport-city">Lincoln Financial Field</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">IAH</span><strong>Houston</strong><span class="stay-airport-city">NRG Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">MCI</span><strong>Kansas City</strong><span class="stay-airport-city">Arrowhead Stadium</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">DEN</span><strong>Denver</strong><span class="stay-airport-city">Empower Field</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">MEX</span><strong>Mexico City</strong><span class="stay-airport-city">Estadio Azteca</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">MTY</span><strong>Monterrey</strong><span class="stay-airport-city">Estadio BBVA</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">GDL</span><strong>Guadalajara</strong><span class="stay-airport-city">Estadio Akron</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">YYZ</span><strong>Toronto</strong><span class="stay-airport-city">BMO Field</span></div>
                      <div class="stay-airport-row"><span class="stay-airport-code">YVR</span><strong>Vancouver</strong><span class="stay-airport-city">BC Place</span></div>
                    </div>
                    <div class="stay-subpanel stay-subpanel--tips">
                      <h3>Tips</h3>
                      <div class="stay-focus-card">
                        <p class="stay-focus-card__label">Book early</p>
                        <p class="stay-focus-card__text">Hotels near host stadiums sell out weeks in advance during match days.</p>
                      </div>
                      <p><strong>Minimum stays.</strong> Many properties enforce 3&#x2013;7 night minimums during tournament weeks. Check cancellation policies carefully &#x2014; some require full pre-payment.</p>
                      <p><strong>Transport.</strong> All host stadiums are served by rideshare (Uber/Lyft in USA &amp; Canada) or taxi. Several US cities have stadium shuttles from city centres on match days. In Mexico City, the Metro runs to Estadio Azteca.</p>
                      <p><strong>Prices.</strong> Expect rates 2&#x2013;4&#xd7; above normal during group stage and knockout games. Mid-week games are cheaper than weekends. Consider staying 1&#x2013;2 cities away and travelling in for the match.</p>
                    </div>
                    <div class="stay-subpanel stay-subpanel--booking">
                      <h3>Book your stay</h3>
                      <section class="stay-booking-panel" aria-label="Book hotels for FIFA World Cup 2026">
                        <div class="stay-booking-panel__header">
                          <p class="stay-section-label">
                            <span class="booking-symbols booking-symbols--small" aria-hidden="true">
                              <svg viewBox="0 0 24 24" focusable="false"><path d="M4 21V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13"></path><path d="M3 21h18"></path><path d="M8 10h1"></path><path d="M12 10h1"></path><path d="M18 21v-6h1a2 2 0 0 1 2 2v4"></path></svg>
                              <svg viewBox="0 0 24 24" focusable="false"><path d="M10.5 4.5 13 12l6.5 2a1.5 1.5 0 0 1 .25 2.78l-1.1.55a2 2 0 0 1-1.75.02L12 15.5 8.5 20H6l2-6-5-3V8.5l5 1.5 1-5.5h1.5Z"></path></svg>
                            </span>
                            <span>BOOK HOTELS &amp; FLIGHTS</span>
                          </p>
                          <h2 class="stay-section-title">Find hotels near your match venue</h2>
                        </div>
                        <div class="stay-form-row">
                          <div class="stay-form-field">
                            <label class="stay-field-label" for="wct-checkin">CHECK-IN</label>
                            <input type="date" id="wct-checkin" class="stay-field-input" value="2026-07-17">
                          </div>
                          <div class="stay-form-field">
                            <label class="stay-field-label" for="wct-checkout">CHECK-OUT</label>
                            <input type="date" id="wct-checkout" class="stay-field-input" value="2026-07-20">
                          </div>
                        </div>
                        <div class="stay-form-row">
                          <div class="stay-form-field">
                            <label class="stay-field-label" for="wct-guests">GUESTS</label>
                            <input type="number" id="wct-guests" class="stay-field-input" value="2" min="1" max="10">
                          </div>
                          <div class="stay-form-field">
                            <label class="stay-field-label" for="wct-rooms">ROOMS</label>
                            <input type="number" id="wct-rooms" class="stay-field-input" value="1" min="1" max="5">
                          </div>
                        </div>
                        <p class="stay-field-label stay-area-label">HOST CITY</p>
                        <div class="stay-area-pills">
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="New+York" checked><span>New York</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Los+Angeles"><span>Los Angeles</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Dallas"><span>Dallas</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="San+Francisco"><span>San Francisco</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Atlanta"><span>Atlanta</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Boston"><span>Boston</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Philadelphia"><span>Philadelphia</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Houston"><span>Houston</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Kansas+City"><span>Kansas City</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Denver"><span>Denver</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Mexico+City"><span>Mexico City</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Monterrey"><span>Monterrey</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Guadalajara"><span>Guadalajara</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Toronto"><span>Toronto</span></label>
                          <label class="stay-area-pill"><input type="radio" name="wct-city" value="Vancouver"><span>Vancouver</span></label>
                        </div>
                        <a class="stay-check-btn" id="wct-booking-tab-btn" href="https://www.kqzyfj.com/click-101771061-15735418?url=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3Fss%3DNew%2BYork%26checkin%3D2026-07-17%26checkout%3D2026-07-20%26group_adults%3D2%26no_rooms%3D1" target="_blank" rel="nofollow sponsored noopener">Check hotel prices</a>
                        <p class="stay-booking-note">OneSliders may earn a commission if you book through Booking.com.</p>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </main>

  <footer class="os-footer site-footer">
    <a class="event-category-link" href="/content/categories/sport/football.html">More Football events &rarr;</a>
  </footer>

<script type="application/json" id="wc2026-schedule">SCHEDULE_PLACEHOLDER</script>

<script>
(function(){
  var raw=document.getElementById('wc2026-schedule');
  if(!raw) return;
  var schedule; try{schedule=JSON.parse(raw.textContent);}catch(e){return;}
  var userTz=Intl.DateTimeFormat().resolvedOptions().timeZone;
  var now=Date.now();
  var tzEl=document.getElementById('mp-tz');
  if(tzEl){var p=new Intl.DateTimeFormat('en',{timeZoneName:'short',timeZone:userTz}).formatToParts(new Date());tzEl.textContent='Local time · '+((p.find(function(x){return x.type==='timeZoneName';})||{}).value||userTz);}
  var mount=document.getElementById('mp-mount');
  if(!mount) return;
  function fmtTime(u){return new Date(u).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:userTz});}
  function fmtDay(u){return new Date(u).toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short',timeZone:userTz});}
  function dayKey(u){return new Date(u).toLocaleDateString('en-CA',{timeZone:userTz});}
  function isPast(u){return new Date(u).getTime()+105*60000<now;}
  function flagEl(t){return t.flag?'<img src="'+t.flag+'" alt="'+t.name+'" width="16" height="11" loading="lazy">':'<span class="mp-flag-ph"></span>';}
  function isUnknown(n){return !n||/^(Winner|Loser|Runner|Best)/i.test(n);}
  function teamEl(t,cls){var u=isUnknown(t.name);return'<div class="'+cls+'">'+(u?'<span class="mp-flag-ph"></span>':flagEl(t))+'<span class="'+(u?'mp-unk':'')+'">'+(t.name||'?')+'</span></div>';}
  var html='';
  (schedule.phases||[]).forEach(function(phase){
    var matches=phase.matches||[];
    var byDay=[],dayMap={},dayLabel={};
    matches.forEach(function(m){var k=dayKey(m.utc);if(!dayMap[k]){dayMap[k]=[];byDay.push(k);dayLabel[k]=fmtDay(m.utc);}dayMap[k].push(m);});
    var gridHtml='<div class="mp-grid">',hasVisible=false;
    byDay.forEach(function(dk){
      var dm=dayMap[dk].filter(function(m){return !isPast(m.utc);});
      if(!dm.length) return;
      hasVisible=true;
      gridHtml+='<div class="mp-day"><div class="mp-day-hd">'+dayLabel[dk]+'</div><div class="mp-day-body">';
      var prevTime='';
      dm.forEach(function(m){
        var t=fmtTime(m.utc),same=(t===prevTime);prevTime=t;
        var badge=m.group?m.group.replace('Group ','Gr.'):(phase.id==='final'?'MetLife':'');
        gridHtml+='<div class="mp-m"><span class="mp-t'+(same?' mp-t--blank':'')+'">'+(same?'':t)+'</span>'+teamEl(m.home,'mp-h')+'<span class="mp-vs">–</span>'+teamEl(m.away,'mp-a')+(badge?'<span class="mp-b">'+badge+'</span>':'')+'</div>';
      });
      gridHtml+='</div></div>';
    });
    gridHtml+='</div>';
    if(hasVisible){html+='<div class="mp-ph"><span class="mp-ph-label">'+phase.label+'</span><span class="mp-ph-line"></span></div>'+gridHtml;}
  });
  mount.innerHTML=html;
})();
</script>

<script>
(function(){
  var raw = document.getElementById('event-year-data');
  if (!raw) return;
  var data; try { data = JSON.parse(raw.textContent); } catch(e) { return; }
  var wMount = document.getElementById('wc-winners-mount');
  if (wMount) {
    var past = (data.editions || []).filter(function(e){ return e.status === 'past'; }).slice().reverse();
    var rows = past.map(function(e){
      var flag = e.winner && e.winner.flag ? '<img src="'+e.winner.flag+'" alt="'+e.winner.name+'" width="18" height="12">' : '';
      var host = (e.countries||[]).map(function(c){return c.name;}).join(', ');
      return '<tr>'
        +'<td>'+e.year+'</td>'
        +'<td>'+host+'</td>'
        +'<td><div class="mp-w-winner">'+flag+(e.winner?e.winner.name:'')+'</div></td>'
        +'<td style="font-size:11px;color:var(--page-muted)">'+e.result+'</td>'
        +'</tr>';
    }).join('');
    wMount.innerHTML = '<table class="mp-wtable">'
      +'<thead><tr><th>Year</th><th>Host</th><th>Winner</th><th>Result</th></tr></thead>'
      +'<tbody>'+rows+'</tbody>'
      +'</table>';
  }
})();
</script>

<script>
(function(){
  var base='https://www.kqzyfj.com/click-101771061-15735418?url=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3F';
  var btn=document.getElementById('wc-booking-btn');
  if(!btn) return;
  function update(){
    var city=(document.querySelector('input[name="wc-city"]:checked')||{}).value||'New+York';
    var cin=document.getElementById('wc-checkin').value||'2026-07-17';
    var cout=document.getElementById('wc-checkout').value||'2026-07-20';
    var guests=document.getElementById('wc-guests').value||'2';
    var rooms=document.getElementById('wc-rooms').value||'1';
    btn.href=base+'ss%3D'+city+'%26checkin%3D'+cin+'%26checkout%3D'+cout+'%26group_adults%3D'+guests+'%26no_rooms%3D'+rooms;
  }
  document.getElementById('wc-stay-booking').addEventListener('change',update);
  var tabBtn=document.getElementById('wct-booking-tab-btn');
  function updateTab(){
    var city=(document.querySelector('input[name="wct-city"]:checked')||{}).value||'New+York';
    var cin=(document.getElementById('wct-checkin')||{}).value||'2026-07-17';
    var cout=(document.getElementById('wct-checkout')||{}).value||'2026-07-20';
    var guests=(document.getElementById('wct-guests')||{}).value||'2';
    var rooms=(document.getElementById('wct-rooms')||{}).value||'1';
    if(tabBtn) tabBtn.href=base+'ss%3D'+city+'%26checkin%3D'+cin+'%26checkout%3D'+cout+'%26group_adults%3D'+guests+'%26no_rooms%3D'+rooms;
  }
  var panelVisit=document.getElementById('panel-visit');
  if(panelVisit) panelVisit.addEventListener('change',updateTab);
  updateTab();
  update();
})();
</script>

</body>
</html>"""

# Inject the extracted JSON back in
HTML = HTML.replace('JSONLD_PLACEHOLDER', jsonld)
HTML = HTML.replace('YEARDATA_PLACEHOLDER', year_data_json)
HTML = HTML.replace('SCHEDULE_PLACEHOLDER', schedule_json)

import os
os.makedirs(os.path.dirname(DST), exist_ok=True)
with open(DST, 'w', encoding='utf-8') as f:
    f.write(HTML)

print(f'Written {len(HTML)} bytes to {DST}')

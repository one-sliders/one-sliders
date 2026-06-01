(function () {
  'use strict';

  var savedKey = 'os_saved_events_v1';
  var followedTeamsKey = 'os_followed_teams_v1';
  var teamHighlightColors = ['yellow', 'blue', 'green', 'pink', 'orange', 'cyan', 'violet', 'lime'];
  var eventTeamIcons = {};

  function readJson(id) {
    var node = document.getElementById(id);
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return null;
    }
  }

  function escapeAttribute(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function siteRootHref() {
    var script = document.currentScript ||
      document.querySelector('script[src*="events.js"]');
    if (!script) return '/';
    var src = script.getAttribute('src') || '';
    return src.replace(/assets\/js\/events\.js(?:\?[^/]*)?$/, '') || '/';
  }

  function ensureSingleFooter() {
    var opt = document.querySelector('meta[name="os-footer"]');
    if (opt && opt.content === 'off') return;

    var root = siteRootHref();
    var year = new Date().getFullYear();
    var content = '<p>&copy; ' + year + ' OneSliders &middot; ' +
      '<a href="' + escapeAttribute(root + 'privacy.html') + '">Privacy</a></p>';
    var footers = Array.prototype.slice.call(document.querySelectorAll('footer'));
    var footer = document.querySelector('footer.event-footer') || footers[0];

    if (!footer) {
      footer = document.createElement('footer');
      document.body.appendChild(footer);
    }

    footer.classList.add('event-footer');
    footer.innerHTML = content;
    footers.forEach(function (item) {
      if (item !== footer) item.remove();
    });
  }

  function escapeIcs(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function calendarStamp() {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  function calendarFilename(value) {
    return String(value || 'calendar')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'calendar';
  }

  function addMinutesToDateTime(dateValue, timeValue, minutes) {
    var dateParts = String(dateValue || '').split('-').map(Number);
    var timeParts = String(timeValue || '').split(':').map(Number);
    if (dateParts.length < 3 || timeParts.length < 2) return '';
    var date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1] + minutes, 0));
    if (isNaN(date.getTime())) return '';
    return date.getUTCFullYear() + pad2(date.getUTCMonth() + 1) + pad2(date.getUTCDate()) +
      'T' + pad2(date.getUTCHours()) + pad2(date.getUTCMinutes()) + '00';
  }

  function matchDateValue(match, edition) {
    if (!match) return '';
    if (match.dateValue) return match.dateValue;
    var raw = String(match.date || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    var found = raw.match(/^(\d{1,2})\s+([A-Za-z]+)/);
    if (!found || !edition || !edition.year) return '';
    var months = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', sept: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12'
    };
    var month = months[found[2].toLowerCase()];
    return month ? edition.year + '-' + month + '-' + pad2(found[1]) : '';
  }

  function matchTimeValue(match) {
    var raw = String((match && (match.time || match.startTime || match.score)) || '').trim();
    var found = raw.match(/^(\d{1,2}):(\d{2})$/);
    return found ? pad2(found[1]) + ':' + found[2] : '';
  }

  function teamLabel(item) {
    return item && item.name ? item.name : 'TBC';
  }

  function hasNamedTeam(item) {
    return !!(item && item.name && item.name !== 'TBC');
  }

  function matchCalendarTitle(data, edition, tab, card, match) {
    var prefix = (data && data.eventName ? data.eventName : 'Event') + (edition && edition.year ? ' ' + edition.year : '');
    if (hasNamedTeam(match.home) && hasNamedTeam(match.away)) {
      return prefix + ': ' + teamLabel(match.home) + ' vs ' + teamLabel(match.away);
    }
    return prefix + ': ' + (match.note || (card && card.label) || (tab && tab.label) || 'Match');
  }

  function matchCalendarLocation(match, edition) {
    return (match && match.venue) || (edition && edition.venue) || '';
  }

  function shouldRenderMatchCalendar(data, edition, tab, match) {
    return !!(
      data && data.slug === 'iihf-world-championship' &&
      edition && edition.status !== 'past' &&
      tab && tab.id === 'playoff' &&
      matchDateValue(match, edition) &&
      matchTimeValue(match)
    );
  }

  function shouldSuppressEditionCalendar(data) {
    return !!(data && data.slug === 'iihf-world-championship');
  }

  function mergeExternalPartBlocks(data, done) {
    var parts = data && data.parts ? data.parts : [];
    // A part pulls live data if it declares externalBlocksSrc (legacy block
    // merge) or liveDataSrc (clean data-only format: teams + groups).
    var pending = parts.filter(function (part) {
      return part.externalBlocksSrc || part.liveDataSrc;
    });
    if (!pending.length) {
      done(data);
      return;
    }

    var remaining = pending.length;
    function finish() {
      remaining -= 1;
      if (remaining <= 0) done(data);
    }

    pending.forEach(function (part) {
      var src = part.liveDataSrc || part.externalBlocksSrc;
      fetch(src, { cache: 'no-cache' })
        .then(function (response) {
          if (!response.ok) throw new Error('Could not load ' + src);
          return response.json();
        })
        .then(function (externalData) {
          // New clean format: { teams, groups } -> build one group-filter block.
          if (externalData && externalData.teams && externalData.groups) {
            var block = buildGroupBlockFromLiveData(externalData);
            if (block) part.blocks = (part.blocks || []).concat([block]);
            return;
          }
          // Legacy format: { parts: { <id>: { blocks: [...] } } }
          var partKey = part.externalBlocksPart || part.id;
          var externalPart = externalData && externalData.parts && externalData.parts[partKey];
          if (externalPart && Array.isArray(externalPart.blocks)) {
            part.blocks = (part.blocks || []).concat(externalPart.blocks);
          }
        })
        .catch(function (error) {
          window.__eventRenderErrors = window.__eventRenderErrors || [];
          window.__eventRenderErrors.push(String(error && error.message ? error.message : error));
        })
        .then(finish);
    });
  }

  // ---- Clean live-data format -> renderable group-filter block ----
  // Input: { teams: { key: {name,url,flag} }, groups: { id: {label, matches[]} },
  //          pointsSystem }
  // A match with a score is completed; without is upcoming. Standings are
  // computed here, never stored in the data file.
  function buildGroupBlockFromLiveData(live) {
    var teams = live.teams || {};
    function resolve(key) { return teams[key] || { name: key }; }

    function parseScore(score) {
      // "3-2", "4-3 OT", "1-2 SO" -> { h, a, ot }
      if (!score) return null;
      var m = String(score).match(/(\d+)\s*[-–]\s*(\d+)\s*(OT|SO)?/i);
      if (!m) return null;
      return { h: Number(m[1]), a: Number(m[2]), ot: !!m[3] };
    }

    var groupIds = Object.keys(live.groups || {});
    // Empty scaffold (no groups, or no matches anywhere) -> render nothing,
    // so wired-but-not-yet-filled events don't show an empty group card.
    var anyMatches = groupIds.some(function (id) {
      var g = live.groups[id];
      return g && g.matches && g.matches.length;
    });
    if (!groupIds.length || !anyMatches) return null;

    var groups = groupIds.map(function (id) {
      var g = live.groups[id];
      var matches = (g.matches || []).map(function (mm) {
        return {
          date: mm.date, time: mm.time, venue: mm.venue, group: g.label,
          home: resolve(mm.home), away: resolve(mm.away),
          score: mm.score, _parsed: parseScore(mm.score)
        };
      });

      var completed = matches.filter(function (m) { return m._parsed; });
      var upcoming  = matches.filter(function (m) { return !m._parsed; });

      // ---- standings (IIHF: 3 reg win, 2 OT/SO win, 1 OT/SO loss, 0 loss) ----
      var table = {};
      function row(team) {
        var k = team.name;
        if (!table[k]) table[k] = { team: team, gp: 0, w: 0, otw: 0, otl: 0, l: 0, gf: 0, ga: 0, pts: 0 };
        return table[k];
      }
      completed.forEach(function (m) {
        var p = m._parsed, H = row(m.home), A = row(m.away);
        H.gp++; A.gp++; H.gf += p.h; H.ga += p.a; A.gf += p.a; A.ga += p.h;
        var simple = (live.pointsSystem === 'simple');
        if (p.h === p.a) { H.pts++; A.pts++; }       // draw (only in simple)
        else if (p.h > p.a) {                         // home win
          if (p.ot && !simple) { H.otw++; H.pts += 2; A.otl++; A.pts += 1; }
          else { H.w++; H.pts += simple ? 2 : 3; A.l++; }
        } else {                                      // away win
          if (p.ot && !simple) { A.otw++; A.pts += 2; H.otl++; H.pts += 1; }
          else { A.w++; A.pts += simple ? 2 : 3; H.l++; }
        }
      });
      var standings = Object.keys(table).map(function (k) { return table[k]; })
        .sort(function (a, b) {
          return b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
            || a.team.name.localeCompare(b.team.name);
        });

      var advanceCount = Number(g.advanceCount || live.advanceCount || 0);
      var qualifiedTeams = advanceCount > 0 ? standings.slice(0, advanceCount).map(function (item) { return item.team; }) : [];

      return {
        id: id, label: g.label,
        upcomingMatches: upcoming,
        completedMatches: completed,
        qualifiedTeams: qualifiedTeams,
        standingsLabel: 'Standings',
        standingsDetail: standings.length ? renderStandings(standings, advanceCount, live.advanceLabel || 'Qualified') : ''
      };
    });

    return {
      label: 'Group tracker',
      title: 'Choose ' + groups.map(function (g) { return g.label; }).join(' or '),
      className: 'part-card--group-filter',
      groupPanels: groups
    };
  }

  function renderStandings(rows, advanceCount, advanceLabel) {
    var hasStatus = Number(advanceCount) > 0;
    var head = '<span class="standings-row standings-row--head">' +
      '<span>#</span><span>Team</span><span>GP</span><span>W</span><span>OT</span><span>L</span><span>PTS</span>' +
      (hasStatus ? '<span>Status</span>' : '') +
      '</span>';
    var body = rows.map(function (r, i) {
      var otCol = (r.otw + r.otl);
      var advanced = hasStatus && i < advanceCount;
      return '<span class="standings-row' + (advanced ? ' standings-row--advance' : ' standings-row--outside') + '">' +
        '<span>' + (i + 1) + '</span>' +
        '<span>' + country(r.team) + '</span>' +
        '<span>' + r.gp + '</span>' +
        '<span>' + r.w + '</span>' +
        '<span>' + otCol + '</span>' +
        '<span>' + r.l + '</span>' +
        '<span><strong>' + r.pts + '</strong></span>' +
        (hasStatus ? '<em class="standings-status standings-status--' + (advanced ? 'advance' : 'outside') + '">' + (advanced ? advanceLabel : 'Out') + '</em>' : '') +
      '</span>';
    }).join('');
    return '<span class="standings-table standings-table--group' + (hasStatus ? ' standings-table--with-status' : '') + '">' + head + body + '</span>';
  }

  function country(item) {
    if (!item) return '';
    var name = item.name || 'TBC';
    var teamIcon = item.icon || eventTeamIcon(name);
    if (item.flag) {
      var image = '<img src="' + escapeAttribute(item.flag) + '" alt="" width="20" height="14">';
      if (!item.url || !item.name) return image + name;
      return '<a class="country" href="' + escapeAttribute(item.url) + '" data-country-name="' + escapeAttribute(name) + '">' + image + name + '</a>';
    }
    if (teamIcon && item.name) {
      var teamImage = '<img class="country__team-icon" src="' + escapeAttribute(teamIcon) + '" alt="" width="40" height="28">';
      if (item.url) {
        return '<a class="country country--team" href="' + escapeAttribute(item.url) + '" data-team-name="' + escapeAttribute(name) + '">' + teamImage + name + '</a>';
      }
      return '<span class="country country--team" data-team-name="' + escapeAttribute(name) + '">' + teamImage + name + '</span>';
    }
    if (!item.url || !item.name) return name;
    return '<a class="country" href="' + escapeAttribute(item.url) + '" data-country-name="' + escapeAttribute(name) + '">' + name + '</a>';
  }

  function stageParticipant(item) {
    if (!item) return '';
    var name = item.name || 'TBC';
    if (item.countryFlag) {
      var flag = '<img src="' + escapeAttribute(item.countryFlag) + '" alt="" width="20" height="14">';
      var title = item.countryName ? ' title="' + escapeAttribute(item.countryName) + '"' : '';
      var content = flag + '<span class="stage-participant__name">' + name + '</span>';
      if (item.countryUrl) {
        return '<a class="stage-participant" href="' + escapeAttribute(item.countryUrl) + '" data-team-name="' + escapeAttribute(name) + '" data-country-name="' + escapeAttribute(item.countryName || '') + '"' + title + '>' + content + '</a>';
      }
      return '<span class="stage-participant" data-team-name="' + escapeAttribute(name) + '" data-country-name="' + escapeAttribute(item.countryName || '') + '"' + title + '>' + content + '</span>';
    }
    if (item.flag || item.url || item.icon || eventTeamIcon(name)) return country(item);
    return '<span class="stage-participant" data-team-name="' + escapeAttribute(name) + '">' + name + '</span>';
  }

  function countries(items) {
    return (items || []).map(country).join(' ');
  }

  function countrySlug(item) {
    var source = item && (item.url || item.flag);
    if (!source) return '';
    var clean = String(source).split('?')[0].split('#')[0].replace(/\/index\.html$/, '').replace(/\/img\/flag\.svg$/, '').replace(/\/$/, '');
    var parts = clean.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  function countryHeroImage(item) {
    if (!item) return '';
    if (item.mini) return item.mini;
    var slug = countrySlug(item);
    if (!slug) return '';
    if (item.flag && String(item.flag).indexOf('/img/flag.svg') >= 0) {
      return String(item.flag).replace('/img/flag.svg', '/img/' + slug + '-mini.png');
    }
    if (item.url && String(item.url).indexOf('/index.html') >= 0) {
      return String(item.url).replace('/index.html', '/img/' + slug + '-mini.png');
    }
    return '';
  }

  function countryHeroCard(item) {
    if (!item || !item.url || !item.name) return country(item);
    var hero = countryHeroImage(item);
    var heroImage = hero
      ? '<img class="country-hero-card__image" src="' + escapeAttribute(hero) + '" alt="" width="96" height="72" loading="lazy">'
      : '';
    var flag = item.flag
      ? '<img class="country-hero-card__flag" src="' + escapeAttribute(item.flag) + '" alt="" width="20" height="14">'
      : '';
    return '<a class="country country--hero-card' + (hero ? '' : ' country--hero-card--no-image') + '" href="' + escapeAttribute(item.url) + '" data-country-name="' + escapeAttribute(item.name) + '">' +
      heroImage +
      '<span class="country-hero-card__copy">' +
        '<span class="country-hero-card__label">' + flag + item.name + '</span>' +
        '<small>Host country</small>' +
      '</span>' +
    '</a>';
  }

  function countryHeroCards(items) {
    if (!items || !items.length) return '';
    return '<span class="country-hero-list">' + (items || []).map(countryHeroCard).join('') + '</span>';
  }

  function removeBrokenCountryHeroImages(root) {
    (root || document).querySelectorAll('.country-hero-card__image').forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) {
        var brokenCard = image.closest('.country--hero-card');
        image.remove();
        if (brokenCard) brokenCard.classList.add('country--hero-card--no-image');
        return;
      }
      image.addEventListener('error', function () {
        var brokenCard = image.closest('.country--hero-card');
        image.remove();
        if (brokenCard) brokenCard.classList.add('country--hero-card--no-image');
      }, { once: true });
    });
  }

  function countryFact(items) {
    var framed = document.body && document.body.classList.contains('event-page--framed');
    return fact('Country', (framed ? countryHeroCards(items) : countries(items)) || 'TBC', framed ? 'fact--country-hero' : '');
  }

  function matchRows(matches, note) {
    var rows = (matches || []).map(function (match) {
      return '<span class="match-result">' +
        '<time>' + (match.date || 'TBC') + '</time>' +
        country(match.home) +
        '<span class="match-score">' + (match.score || 'TBC') + '</span>' +
        country(match.away) +
      '</span>';
    }).join('');
    return '<span class="match-results">' + rows + '</span>' +
      (note ? '<span class="match-note">' + note + '</span>' : '');
  }

  function upcomingRows(matches, note) {
    var rows = (matches || []).map(function (match) {
      return '<span class="upcoming-match">' +
        '<span class="upcoming-match__meta">' + (match.dateLabel || match.date || 'TBC') + ' Â· ' + (match.time || 'TBC') + '</span>' +
        '<span class="upcoming-match__teams">' + country(match.home) + '<span class="match-score">vs</span>' + country(match.away) + '</span>' +
        '<span class="upcoming-match__place">' + (match.group || 'Group') + ' Â· ' + (match.venue || 'Venue TBC') + '</span>' +
      '</span>';
    }).join('');
    return '<span class="upcoming-list" aria-label="Upcoming matches">' + rows + '</span>' +
      (note ? '<span class="match-note">' + note + '</span>' : '');
  }

  function upcomingTabs(groups, note) {
    var items = groups || [];
    var tabs = items.map(function (group, index) {
      return '<button class="upcoming-tab" type="button" role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '" data-upcoming-tab="' + group.id + '">' + group.label + '</button>';
    }).join('');
    var panels = items.map(function (group, index) {
      return '<span class="upcoming-tab-panel" role="tabpanel" data-upcoming-panel="' + group.id + '"' + (index === 0 ? '' : ' hidden') + '>' +
        upcomingRows(group.matches, '') +
      '</span>';
    }).join('');
    return '<span class="upcoming-tabs" role="tablist" aria-label="Upcoming group games">' + tabs + '</span>' +
      panels +
      (note ? '<span class="match-note">' + note + '</span>' : '');
  }

  function groupPanels(groups, note) {
    var items = groups || [];
    function qualifiedStrip(group) {
      var teams = group.qualifiedTeams || [];
      if (!teams.length) return '';
      return '<span class="qualified-strip">' +
          '<span class="qualified-strip__label">Qualified for playoffs</span>' +
          '<span class="qualified-strip__teams">' + teams.map(country).join(' ') + '</span>' +
        '</span>';
    }
    function teamPicker(group) {
      var teamsByName = {};
      (group.upcomingMatches || []).concat(group.completedMatches || []).forEach(function (match) {
        [match.home, match.away].forEach(function (team) {
          if (team && team.name) teamsByName[team.name] = team;
        });
      });
      return '<span class="follow-team" aria-label="Choose teams to highlight">' +
          '<span class="follow-team__label">I cheer for</span>' +
          '<span class="follow-team__list">' +
            Object.keys(teamsByName).sort().map(function (name) {
              var team = teamsByName[name];
              return '<button class="follow-team__button" type="button" aria-pressed="false" data-follow-team="' + name + '">' + country(team) + '</button>';
            }).join('') +
          '</span>' +
        '</span>';
    }
    var controls = items.map(function (group, index) {
      return '<button class="group-filter__button" type="button" aria-pressed="' + (index === 0 ? 'true' : 'false') + '" data-group-panel-button="' + group.id + '">' + group.label + '</button>';
    }).join('');
    var panels = items.map(function (group, index) {
      return '<span class="group-filter__panel" data-group-panel="' + group.id + '"' + (index === 0 ? '' : ' hidden') + '>' +
        teamPicker(group) +
        qualifiedStrip(group) +
        '<span class="group-filter__section">' +
          '<span class="group-filter__label">Upcoming</span>' +
          upcomingRows(group.upcomingMatches || [], '') +
        '</span>' +
        '<span class="group-filter__section group-filter__section--results">' +
          '<span class="group-filter__label">Results</span>' +
          matchRows((group.completedMatches || []).slice().reverse(), '') +
        '</span>' +
        '<span class="group-filter__section group-filter__section--standings">' +
          '<span class="group-filter__label">' + (group.standingsLabel || 'Standings') + '</span>' +
          (group.standingsDetail || '') +
        '</span>' +
      '</span>';
    }).join('');
    return '<span class="group-filter__topline">' +
        '<span class="group-filter__controls" aria-label="Choose group">' + controls + '</span>' +
      '</span>' +
      panels +
      (note ? '<span class="match-note">' + note + '</span>' : '');
  }

  function normalizeTeamName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function teamColorIndex(name) {
    var hash = 0;
    String(name || '').split('').forEach(function (char) {
      hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
    });
    return hash % teamHighlightColors.length;
  }

  function teamColorClass(name) {
    return 'team-color-' + teamHighlightColors[teamColorIndex(normalizeTeamName(name))];
  }

  function setEventTeamIcons(data) {
    eventTeamIcons = {};
    var icons = (data && data.teamIcons) || {};
    Object.keys(icons).forEach(function (name) {
      eventTeamIcons[normalizeTeamName(name)] = icons[name];
    });
  }

  function eventTeamIcon(name) {
    return eventTeamIcons[normalizeTeamName(name)] || '';
  }

  function readFollowedTeams() {
    try {
      var value = JSON.parse(localStorage.getItem(followedTeamsKey) || '[]');
      return Array.isArray(value) ? value.map(normalizeTeamName).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function writeFollowedTeams(teams) {
    localStorage.setItem(followedTeamsKey, JSON.stringify(teams));
  }

  function countryNameFromNode(node) {
    if (!node) return '';
    return node.getAttribute('data-country-name') || node.getAttribute('data-team-name') || node.textContent || '';
  }

  function applyFollowedTeams(root) {
    var followed = readFollowedTeams();
    var followedSet = {};
    followed.forEach(function (name) { followedSet[name] = true; });
    var colorClasses = teamHighlightColors.map(function (color) { return 'team-color-' + color; }).concat(['team-color-mixed']);
    (root || document).querySelectorAll('.follow-team__button').forEach(function (button) {
      var name = normalizeTeamName(button.getAttribute('data-follow-team'));
      button.classList.remove.apply(button.classList, colorClasses);
      button.setAttribute('aria-pressed', followedSet[name] ? 'true' : 'false');
    });
    (root || document).querySelectorAll('.country').forEach(function (node) {
      var name = normalizeTeamName(countryNameFromNode(node));
      node.classList.remove.apply(node.classList, colorClasses);
      node.classList.toggle('country--followed', !!followedSet[name]);
      if (followedSet[name]) node.classList.add(teamColorClass(name));
    });
    (root || document).querySelectorAll('.match-result, .upcoming-match, .standings-row').forEach(function (row) {
      row.classList.remove.apply(row.classList, colorClasses);
      row.classList.remove('team-followed-row');
    });
  }

  function f1TeamClass(name) {
    return 'f1-team--' + String(name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function enhanceF1Cards(root) {
    (root || document).querySelectorAll('.part-card--f1-live .standings-row:not(.standings-row--head)').forEach(function (row) {
      var cells = row.children;
      if (cells.length < 3) return;
      var labelCell = cells[1];
      var teamCell = cells[2];
      labelCell.classList.add('f1-driver');
      var teamText = (teamCell.textContent || '').trim();
      if (!teamText || teamText === 'TBC') return;
      if (teamText.indexOf(' - ') >= 0) {
        var parts = teamText.split(' - ');
        teamCell.innerHTML = '<span class="f1-driver">' + parts[0] + '</span><span class="f1-team ' + f1TeamClass(parts.slice(1).join(' - ')) + '">' + parts.slice(1).join(' - ') + '</span>';
      } else {
        teamCell.classList.add('f1-team', f1TeamClass(teamText));
      }
    });
  }

  function city(item) {
    if (!item) return 'TBC';
    if (!item.url) return item.name || 'TBC';
    return '<a class="city-link" href="' + item.url + '">' + item.name + '</a>';
  }

  function clockText(diff) {
    var totalSeconds = Math.max(0, Math.floor(Math.abs(diff) / 1000));
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    if (days > 0) return days + ' days ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
    return hours + 'h ' + minutes + 'm ' + seconds + 's';
  }

  function daysText(startDate, nextDate) {
    var start = new Date(startDate + 'T00:00:00');
    var now = new Date();
    if (isNaN(start.getTime())) return 'TBC';
    var diff = start.getTime() - now.getTime();
    if (diff >= 0) return clockText(diff) + ' to go';
    if (nextDate) {
      var next = new Date(nextDate + 'T00:00:00');
      if (!isNaN(next.getTime())) return clockText(next.getTime() - now.getTime()) + ' to next edition';
    }
    return clockText(diff) + ' ago';
  }

  function hasValidDate(value) {
    if (!value) return false;
    var date = new Date(value + 'T00:00:00');
    return !isNaN(date.getTime());
  }

  function parseDateOnly(value) {
    var parts = String(value || '').split('-').map(Number);
    if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return null;
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return isNaN(date.getTime()) ? null : date;
  }

  function dateOnlyToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function addDays(date, days) {
    if (!date) return null;
    var copy = new Date(date.getTime());
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function isoDateOnly(date) {
    if (!date) return '';
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function displayDate(date) {
    if (!date) return 'TBC';
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(date);
  }

  function weatherWindow(edition) {
    var start = parseDateOnly(edition && edition.startDate);
    var exclusiveEnd = parseDateOnly(edition && edition.endExclusive);
    var inclusiveEnd = parseDateOnly(edition && edition.endDate);
    if (exclusiveEnd) inclusiveEnd = addDays(exclusiveEnd, -1);
    if (!start || !inclusiveEnd) return null;
    return {
      start: addDays(start, -7),
      forecastStart: start,
      end: inclusiveEnd
    };
  }

  function shouldShowWeather(edition) {
    var windowDates = weatherWindow(edition);
    if (!windowDates) return false;
    var today = dateOnlyToday();
    return today >= windowDates.start && today <= windowDates.end;
  }

  function weatherCodeLabel(code) {
    var labels = {
      0: 'Clear',
      1: 'Mostly clear',
      2: 'Partly cloudy',
      3: 'Cloudy',
      45: 'Fog',
      48: 'Rime fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      56: 'Freezing drizzle',
      57: 'Freezing drizzle',
      61: 'Light rain',
      63: 'Rain',
      65: 'Heavy rain',
      66: 'Freezing rain',
      67: 'Freezing rain',
      71: 'Light snow',
      73: 'Snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Rain showers',
      82: 'Heavy showers',
      85: 'Snow showers',
      86: 'Snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with hail'
    };
    return labels[Number(code)] || 'Weather';
  }

  function renderWeatherCard(data, edition) {
    var weather = edition && edition.weather;
    var windowDates = weatherWindow(edition);
    if (!weather || !shouldShowWeather(edition) || !weather.latitude || !weather.longitude || !windowDates) return '';
    var today = dateOnlyToday();
    var queryStart = today > windowDates.forecastStart ? today : windowDates.forecastStart;
    if (queryStart > windowDates.end) return '';
    var title = weather.label || ((weather.location || edition.venue || data.eventName) + ' weather');
    var note = weather.note || weather.outdoorNote || 'Forecast updates automatically while the event is close enough for weather to matter.';
    return '<section class="event-weather-card" data-weather-card' +
      ' data-latitude="' + escapeAttribute(weather.latitude) + '"' +
      ' data-longitude="' + escapeAttribute(weather.longitude) + '"' +
      ' data-start-date="' + escapeAttribute(isoDateOnly(queryStart)) + '"' +
      ' data-end-date="' + escapeAttribute(isoDateOnly(windowDates.end)) + '"' +
      ' data-location="' + escapeAttribute(weather.location || edition.venue || '') + '"' +
      ' data-source-label="' + escapeAttribute(weather.sourceLabel || 'Open-Meteo forecast') + '"' +
      '>' +
        '<div class="event-weather-card__head">' +
          '<span>Weather</span>' +
          '<strong>' + title + '</strong>' +
          '<p>' + displayDate(windowDates.start) + ' - ' + displayDate(windowDates.end) + '. ' + note + '</p>' +
        '</div>' +
        '<div class="event-weather-card__body" data-weather-body>Loading forecast...</div>' +
      '</section>';
  }

  function renderWeatherRows(daily, startDate, endDate) {
    if (!daily || !daily.time || !daily.time.length) return '';
    var rows = daily.time.map(function (date, index) {
      var parsed = parseDateOnly(date);
      if ((startDate && parsed < startDate) || (endDate && parsed > endDate)) return '';
      var min = daily.temperature_2m_min && daily.temperature_2m_min[index];
      var max = daily.temperature_2m_max && daily.temperature_2m_max[index];
      var rainChance = daily.precipitation_probability_max && daily.precipitation_probability_max[index];
      var rainAmount = daily.precipitation_sum && daily.precipitation_sum[index];
      var wind = daily.wind_speed_10m_max && daily.wind_speed_10m_max[index];
      var tempLabel = min == null || max == null ? 'Temp TBC' : Math.round(min) + '-' + Math.round(max) + '&deg;C';
      return '<div class="event-weather-day">' +
        '<time>' + displayDate(parsed) + '</time>' +
        '<strong>' + weatherCodeLabel(daily.weather_code && daily.weather_code[index]) + '</strong>' +
        '<span>' + tempLabel + '</span>' +
        '<span>' + (rainChance == null ? 'Rain TBC' : rainChance + '% rain') + '</span>' +
        '<span>' + (rainAmount == null ? '0 mm' : rainAmount + ' mm') + '</span>' +
        '<span>' + (wind == null ? 'Wind TBC' : Math.round(wind) + ' km/h wind') + '</span>' +
      '</div>';
    }).filter(Boolean).join('');
    return rows ? '<div class="event-weather-list">' + rows + '</div>' : '';
  }

  function hydrateWeatherCards(root) {
    (root || document).querySelectorAll('[data-weather-card]').forEach(function (card) {
      var body = card.querySelector('[data-weather-body]');
      if (!body || card.getAttribute('data-weather-loaded') === 'true') return;
      card.setAttribute('data-weather-loaded', 'true');
      var startDate = parseDateOnly(card.getAttribute('data-start-date'));
      var endDate = parseDateOnly(card.getAttribute('data-end-date'));
      var url = 'https://api.open-meteo.com/v1/forecast?' + [
        'latitude=' + encodeURIComponent(card.getAttribute('data-latitude')),
        'longitude=' + encodeURIComponent(card.getAttribute('data-longitude')),
        'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
        'timezone=auto',
        'forecast_days=16'
      ].join('&');
      fetch(url, { cache: 'no-cache' })
        .then(function (response) {
          if (!response.ok) throw new Error('Weather fetch failed');
          return response.json();
        })
        .then(function (forecast) {
          var rows = renderWeatherRows(forecast && forecast.daily, startDate, endDate);
          body.innerHTML = rows || '<p>Forecast is not available for this event window yet.</p>';
        })
        .catch(function () {
          body.innerHTML = '<p>Forecast could not load. Check the local forecast before heading to outdoor parts of the event.</p>';
        });
    });
  }

  function fact(label, html, className) {
    return '<div class="fact' + (className ? ' ' + className : '') + '"><span>' + label + '</span><strong>' + html + '</strong></div>';
  }

  function question(item) {
    return '<div class="question"><span>' + item.q + '</span><strong>' + item.a + '</strong><p>' + item.detail + '</p></div>';
  }

  function highlight(item) {
    return '<div class="card"><span>' + item.label + '</span><strong>' + item.title + '</strong><p>' + item.detail + '</p></div>';
  }

  function sourceCard(data) {
    if (!data || !data.showSourceCard) return '';
    var sources = (data.sources || []).map(function (source) {
      return '<a href="' + escapeAttribute(source.url) + '">' + (source.label || source.url) + '</a>';
    }).join(' ');
    return '<div class="sources"><span>Sources</span><p>' +
      (sources || 'Official event information') +
      (data.lastUpdated ? ' &middot; Last updated: ' + data.lastUpdated : '') +
    '</p></div>';
  }

  function buildHotelAffiliateUrl(options) {
    options = options || {};
    var params = new URLSearchParams();
    params.set('destination', options.destination || '');
    params.set('checkin', options.checkIn || '');
    params.set('checkout', options.checkOut || '');
    params.set('adults', options.adults || 2);
    params.set('rooms', options.rooms || 1);
    params.set('campaign', options.campaign || '');
    // TODO: Replace this placeholder with the approved hotel affiliate deep-link provider.
    return (location.pathname || '') + '#year-2027';
  }

  function buildProductAffiliateUrl(options) {
    options = options || {};
    var params = new URLSearchParams();
    params.set('category', options.category || '');
    params.set('campaign', options.campaign || '');
    // TODO: Replace this placeholder with the approved product affiliate deep-link provider.
    return (location.pathname || '') + '#year-2027';
  }

  function renderAffiliateLink(link, className) {
    if (!link) return '';
    var href = link.href || '';
    if (link.builder === 'hotel') href = buildHotelAffiliateUrl(link);
    if (link.builder === 'product') href = buildProductAffiliateUrl(link);
    var tracking = [
      link.event ? ' data-event="' + escapeAttribute(link.event) + '"' : '',
      link.affiliateType ? ' data-affiliate-type="' + escapeAttribute(link.affiliateType) + '"' : '',
      link.campaign ? ' data-campaign="' + escapeAttribute(link.campaign) + '"' : '',
      link.pageTopic ? ' data-page-topic="' + escapeAttribute(link.pageTopic) + '"' : '',
      link.pageEvent ? ' data-page-event="' + escapeAttribute(link.pageEvent) + '"' : ''
    ].join('');
    return '<a class="event-button ' + (className || '') + '" href="' + escapeAttribute(href) + '"' +
      ' rel="sponsored nofollow"' + tracking + '>' + (link.label || 'Open') + '</a>';
  }

  function renderHotelModule(module) {
    if (!module) return '';
    var stayAreas = (module.stayAreas || []).map(function (area) {
      return '<li>' + area + '</li>';
    }).join('');
    return '<section class="commercial-module commercial-module--hotel" id="ryder-cup-2027-hotels">' +
      '<div class="commercial-module__header"><span>Hotels</span><strong>' + (module.title || 'Stay near the event') + '</strong></div>' +
      '<div class="commercial-facts">' +
        fact('Destination', module.destination || 'TBC') +
        fact('Check-in', module.checkIn || 'TBC') +
        fact('Check-out', module.checkOut || 'TBC') +
        fact('Guests', (module.adults || 2) + ' adults') +
        fact('Rooms', module.rooms || 1) +
      '</div>' +
      (stayAreas ? '<div class="commercial-module__body"><span>Alternative stay areas</span><ul class="event-list event-list--compact">' + stayAreas + '</ul></div>' : '') +
      '<div class="actions-row">' + renderAffiliateLink({
        builder: 'hotel',
        label: module.cta || 'Check hotel prices',
        destination: module.destination,
        checkIn: module.checkIn,
        checkOut: module.checkOut,
        adults: module.adults,
        rooms: module.rooms,
        campaign: module.campaign,
        event: 'affiliate_click',
        affiliateType: 'hotel',
        pageTopic: module.pageTopic,
        pageEvent: module.pageEvent
      }, 'event-button--inline') + '</div>' +
    '</section>';
  }

  function renderGolfTripModule(module) {
    if (!module) return '';
    var cards = (module.cards || []).map(function (card) {
      return '<div class="edition-compact-card"><span>' + (card.label || 'Golf trip') + '</span><strong>' + card.title + '</strong>' +
        (card.detail ? '<p>' + card.detail + '</p>' : '') + '</div>';
    }).join('');
    var actions = (module.links || []).map(function (link) {
      return renderAffiliateLink(link, 'event-button--inline');
    }).join('');
    return '<section class="commercial-module commercial-module--golf-trip" id="ryder-cup-2027-golf-trip">' +
      '<div class="commercial-module__header"><span>Golf trip</span><strong>' + (module.title || 'Turn it into a golf trip') + '</strong></div>' +
      '<div class="edition-overview__cards edition-overview__cards--three">' + cards + '</div>' +
      (actions ? '<div class="actions-row">' + actions + '</div>' : '') +
    '</section>';
  }

  function renderLeadModule(module) {
    if (!module) return '';
    var options = (module.interests || []).map(function (interest) {
      return '<option value="' + escapeAttribute(interest.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '">' + interest + '</option>';
    }).join('');
    return '<section class="commercial-module commercial-module--lead">' +
      '<div class="commercial-module__header"><span>Updates</span><strong>' + (module.title || 'Get event updates') + '</strong></div>' +
      '<form class="lead-form" data-event="lead_capture" data-lead-type="' + escapeAttribute(module.leadType || '') + '" data-campaign="' + escapeAttribute(module.campaign || '') + '">' +
        '<label><span>Email</span><input type="email" name="email" autocomplete="email" required></label>' +
        '<label><span>Interest</span><select name="interest">' + options + '</select></label>' +
        '<button class="event-button" type="submit">' + (module.cta || 'Send me updates') + '</button>' +
      '</form>' +
      '<p class="commercial-module__note">TODO: Connect this form to the approved lead-capture backend before collecting submissions.</p>' +
    '</section>';
  }

  function renderFaqModule(items) {
    if (!items || !items.length) return '';
    return '<section class="commercial-module commercial-module--faq">' +
      '<div class="commercial-module__header"><span>FAQ</span><strong>Ryder Cup 2027 questions</strong></div>' +
      '<div class="faq-list">' + items.map(function (item) {
        return '<details><summary>' + item.q + '</summary><p>' + item.a + '</p></details>';
      }).join('') + '</div>' +
    '</section>';
  }

  function renderRyderLiveModule(module) {
    if (!module) return '';
    var sessions = (module.sessions || []).map(function (label) {
      return '<div class="live-session-row"><span>' + label + '</span><strong>TBC</strong><em>Not started</em></div>';
    }).join('');
    return '<section class="commercial-module commercial-module--results" data-ryder-live-results data-live-src="' + escapeAttribute(module.src || '') + '">' +
      '<div class="commercial-module__header"><span>Results</span><strong>' + (module.title || 'Ryder Cup results') + '</strong></div>' +
      '<div class="live-scoreboard">' +
        '<div class="live-total live-total--europe"><span>' + country({ name: 'Europe', icon: '/assets/icons/europe-team.svg' }) + '</span><strong data-live-total="europe">TBC</strong></div>' +
        '<div class="live-total live-total--usa"><span>' + country({ name: 'United States', url: '/content/locations/north-america/usa/index.html', flag: '/content/locations/north-america/usa/img/flag.svg' }) + '</span><strong data-live-total="usa">TBC</strong></div>' +
      '</div>' +
      '<div class="edition-compact-card"><span>Current session</span><strong data-live-current-session>TBC</strong><p data-live-status>' + (module.emptyText || module.statusText || 'Results appear here during the event.') + '</p></div>' +
      '<div class="live-session-list" data-live-session-list>' + sessions + '</div>' +
      '<p class="commercial-module__note" data-live-updated>Not live yet.</p>' +
    '</section>';
  }

  function renderCurrentEditionModules(edition) {
    if (!edition || !edition.currentModules) return '';
    return [
      renderHotelModule(edition.currentModules.hotel),
      renderGolfTripModule(edition.currentModules.golfTrip),
      renderLeadModule(edition.currentModules.lead),
      renderFaqModule(edition.currentModules.faq)
    ].join('');
  }

  function renderHistoricalCurrentCta(edition) {
    if (!edition || !edition.currentCta) return '';
    return '<div class="card card--current-guide"><span>Planning the next Ryder Cup?</span>' +
      '<strong>' + edition.currentCta.title + '</strong><p>' + edition.currentCta.detail + '</p>' +
      '<div class="actions-row"><a class="event-button event-button--inline" href="#year-' + escapeAttribute(edition.currentCta.year || '2027') + '" data-edition-tab-target="stay">' +
      (edition.currentCta.cta || 'View current guide') + '</a></div></div>';
  }

  function compactFacts(items) {
    return '<div class="facts-strip facts-strip--compact">' + (items || []).map(function (item) {
      return fact(item.label, item.value);
    }).join('') + '</div>';
  }

  function renderCompactCountdown(edition) {
    if (!edition || edition.status === 'past') return '';
    var countdownTarget = edition.countdownDate || edition.startDate;
    return '<div class="countdown countdown--compact" data-countdown="' + countdownTarget + '" data-next-date="' + (edition.nextDate || '') + '">' +
      '<span>' + (edition.countdownLabel || 'Event starts') + '</span><strong>' + daysText(countdownTarget, edition.nextDate) + '</strong><p>' + (edition.countdownText || '') + '</p></div>';
  }

  function renderSessionScores(edition) {
    var rows = edition && edition.sessionScores ? edition.sessionScores : [];
    if (!rows.length) return '';
    var europe = country({ name: 'Europe', icon: '/assets/icons/europe-team.svg' });
    var usa = country({ name: 'United States', url: '/content/locations/north-america/usa/index.html', flag: '/content/locations/north-america/usa/img/flag.svg' });
    return '<div class="card card--session-scores"><span>Score by session</span><strong>Momentum after each round</strong>' +
      '<div class="session-score-visual">' +
        '<div class="session-score-teams"><b>' + europe + '</b><b>' + usa + '</b></div>' +
        rows.map(function (row) {
          var europeScore = Number(row.europe);
          var usaScore = Number(row.usa);
          var total = Math.max(1, europeScore + usaScore);
          var europePct = Math.max(4, Math.min(96, (europeScore / total) * 100));
          var usaPct = Math.max(4, Math.min(96, (usaScore / total) * 100));
          var leader = europeScore === usaScore ? 'Tie' : (europeScore > usaScore ? 'Europe lead' : 'USA lead');
          return '<div class="session-score-step">' +
            '<div class="session-score-step__meta"><span>' + row.label + '</span><strong>' + row.europe + ' - ' + row.usa + '</strong><em>' + leader + '</em></div>' +
            '<div class="session-score-bars" aria-label="' + escapeAttribute(row.label + ': Europe ' + row.europe + ', United States ' + row.usa) + '">' +
              '<i class="session-score-bars__europe" data-score-width="' + europePct.toFixed(2) + '"></i>' +
              '<i class="session-score-bars__usa" data-score-width="' + usaPct.toFixed(2) + '"></i>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div></div>';
  }

  function renderRyderTabPanel(tab) {
    return '<section class="edition-tab-panel" data-edition-tab-panel="' + escapeAttribute(tab.id) + '"' + (tab.active ? '' : ' hidden') + '>' +
      tab.html +
    '</section>';
  }

  function renderRyderTabs(data, edition, target) {
    var current = edition.status !== 'past';
    var modules = edition.currentModules || {};
    if (!current) {
      renderRyderHistoricalEdition(data, edition, target);
      return;
    }
    var defaultTab = window.__eventPendingTab || 'stay';
    window.__eventPendingTab = '';
    var overviewFacts = compactFacts([
      { label: 'Venue', value: edition.venue || 'TBC' },
      { label: 'City', value: (edition.cities || []).map(city).join(' ') || 'TBC' },
      { label: 'Country', value: countries(edition.countries || []) || 'TBC' },
      { label: 'Dates', value: edition.dates || 'TBC' },
      { label: 'Format', value: edition.format || 'TBC' }
    ]);
    var tabs = [
      { id: 'stay', label: 'Stay', html: renderHotelModule(modules.hotel) + '<div class="edition-compact-card"><span>Airport note</span><strong>Shannon is closest</strong><p>Cork and Dublin may also work depending on routes.</p></div>' },
      { id: 'results', label: 'Results', html: renderRyderLiveModule(edition.liveResults) },
      { id: 'overview', label: 'Overview', html: overviewFacts + compactFacts([
        { label: 'Match days', value: edition.matchDays || '17-19 Sep 2027' },
        { label: 'Teams', value: country({ name: 'Europe', icon: '/assets/icons/europe-team.svg' }) + ' vs ' + country({ name: 'United States', url: '/content/locations/north-america/usa/index.html', flag: '/content/locations/north-america/usa/img/flag.svg' }) }
      ]) + renderCompactCountdown(edition) + '<div class="edition-compact-card"><span>Official info</span><strong>Check official channels before booking</strong><p>OneSliders is an independent guide. Confirm ticketing, transport and event access with official Ryder Cup information.</p></div>' + renderFaqModule(modules.faq) },
      { id: 'golf-trip', label: 'Golf trip', html: renderGolfTripModule(modules.golfTrip) },
      { id: 'updates', label: 'Updates', html: renderLeadModule(modules.lead) }
    ];
    if (!tabs.some(function (tab) { return tab.id === defaultTab; })) defaultTab = tabs[0].id;
    tabs.forEach(function (tab) { tab.active = tab.id === defaultTab; });
    target.innerHTML = '<div class="edition-tabs" data-edition-tabs>' +
      '<div class="edition-tablist" role="tablist" aria-label="Ryder Cup section">' +
      tabs.map(function (tab) {
        return '<button class="edition-tab" type="button" role="tab" aria-selected="' + (tab.active ? 'true' : 'false') + '" data-edition-tab="' + tab.id + '">' + tab.label + '</button>';
      }).join('') + '</div>' +
      '<div class="edition-tab-panels">' + tabs.map(renderRyderTabPanel).join('') + '</div></div>' +
      sourceCard(data);
    bindEditionTabs(target);
  }

  function renderRyderHistoricalEdition(data, edition, target) {
    var resultTitle = edition.winner ? country(edition.winner) : (edition.resultLabel || 'Result');
    var runnerUp = edition.runnerUp ? country(edition.runnerUp) : '';
    target.innerHTML = '<div class="ryder-archive-panel">' +
      '<div class="facts-strip facts-strip--compact">' +
        fact('Venue', edition.venue || 'TBC') +
        fact('Dates', edition.dates || 'TBC') +
        fact('Status', edition.statusLabel || 'Complete') +
      '</div>' +
      '<div class="facts-strip facts-strip--compact">' +
        fact('Winner', resultTitle) +
        fact('Score', edition.resultScore || 'TBC') +
        fact('Runner-up', runnerUp || 'TBC') +
      '</div>' +
      renderSessionScores(edition) +
    '</div>';
  }

  function updateEditionIdentity(data, edition) {
    if (!edition) return;
    var title = edition.h1 || ((data && data.eventName ? data.eventName : 'Event') + ' ' + edition.year);
    var dateValue = edition.status === 'past' ? (edition.dates || 'TBC') : (edition.dates || '13-19 Sep 2027');
    var locationValue = countries(edition.countries || []) || 'TBC';
    var resultValue = edition.status === 'past'
      ? (edition.winner ? country(edition.winner) : (edition.resultLabel || edition.result || 'Result TBC'))
      : country({ name: 'Europe', icon: '/assets/icons/europe-team.svg' }) + ' vs ' + country({ name: 'United States', url: '/content/locations/north-america/usa/index.html', flag: '/content/locations/north-america/usa/img/flag.svg' });
    var introValue = edition.status === 'past'
      ? 'Historical Ryder Cup result: where it was played, when it happened and who won.'
      : 'The Ryder Cup is golf\'s Europe vs United States team match-play event. The next edition is at Adare Manor in Limerick, Ireland, with event week set for 13-19 September 2027.';
    document.querySelectorAll('[data-year-title]').forEach(function (node) { node.textContent = title; });
    document.querySelectorAll('[data-identity-intro]').forEach(function (node) { node.textContent = introValue; });
    document.querySelectorAll('[data-identity-date]').forEach(function (node) { node.innerHTML = dateValue; });
    document.querySelectorAll('[data-identity-venue]').forEach(function (node) { node.innerHTML = edition.venue || 'TBC'; });
    document.querySelectorAll('[data-identity-location]').forEach(function (node) { node.innerHTML = locationValue; });
    document.querySelectorAll('[data-identity-result]').forEach(function (node) { node.innerHTML = resultValue; });
    document.querySelectorAll('[data-current-only]').forEach(function (node) {
      node.hidden = edition.status === 'past';
    });
    document.querySelectorAll('[data-hide-archive]').forEach(function (node) {
      node.hidden = edition.status === 'past';
    });
  }

  function editionActionButtons(data, edition, allowCalendar) {
    if (!edition || edition.status === 'past') return '';
    var buttons = [];
    if (allowCalendar && hasValidDate(edition.startDate)) {
      buttons.push('<button class="event-button" type="button" data-calendar-download>Add to calendar</button>');
    }
    buttons.push('<button class="event-button" type="button" data-save-event="' +
      escapeAttribute(((data && data.slug) || 'event') + '-' + edition.year) +
      '" data-save-label="Save / remind me" data-saved-label="Saved">Save / remind me</button>');
    return '<div class="actions-row">' + buttons.join('') + '</div>';
  }

  function isPlaceholderText(value) {
    var text = String(value || '').toLowerCase();
    return !text ||
      text.indexOf('tbc') >= 0 ||
      text.indexOf('to be confirmed') >= 0 ||
      text.indexOf('pending') >= 0 ||
      text.indexOf('add verified') >= 0 ||
      text.indexOf('once verified') >= 0 ||
      text.indexOf('final result not entered') >= 0 ||
      text.indexOf('archive details') >= 0 ||
      text.indexOf('detailed results') >= 0 ||
      text.indexOf('past edition details') >= 0;
  }

  function isPlaceholderArchive(item) {
    if (!item) return false;
    return isPlaceholderText([item.label, item.title, item.detail].join(' '));
  }

  function standingRows(items) {
    if (!items || !items.length) return '';
    return '<div class="standing-list">' + items.map(function (item) {
      return '<div class="standing-row"><strong>' + item.rank + '</strong><span>' + country(item.team) + '</span><em>' + item.note + '</em></div>';
    }).join('') + '</div>';
  }

  function resultRows(items) {
    if (!items || !items.length) return '';
    return '<div class="result-list">' + items.map(function (item) {
      return '<div class="result-row"><span>' + item.label + '</span><strong>' + country(item.home) + ' ' + item.score + ' ' + country(item.away) + '</strong></div>';
    }).join('') + '</div>';
  }

  function compactCard(item) {
    if (!item) return '';
    return '<div class="edition-compact-card">' +
      '<span>' + (item.label || '') + '</span>' +
      '<strong>' + (item.title || '') + '</strong>' +
      (item.detail ? '<p>' + item.detail + '</p>' : '') +
    '</div>';
  }

  function renderStageStandings(rows) {
    if (!rows || !rows.length) return '';
    var body = rows.map(function (row) {
      return '<span class="stage-standing-row">' +
        '<b>' + (row.rank || '') + '</b>' +
        '<span>' + country(row.team) + '</span>' +
        '<strong>' + (row.pts || row.points || 'TBC') + '</strong>' +
        '<em>' + (row.note || '') + '</em>' +
      '</span>';
    }).join('');
    return '<span class="stage-standings">' +
      '<span class="stage-standing-row stage-standing-row--head"><b>#</b><span>Team</span><strong>PTS</strong><em>Status</em></span>' +
      body +
    '</span>';
  }

  function renderMatchCalendarButton(data, edition, tab, card, match) {
    if (!shouldRenderMatchCalendar(data, edition, tab, match)) return '';
    var dateValue = matchDateValue(match, edition);
    var timeValue = matchTimeValue(match);
    var title = matchCalendarTitle(data, edition, tab, card, match);
    var filenameLabel = hasNamedTeam(match.home) && hasNamedTeam(match.away)
      ? teamLabel(match.home) + ' vs ' + teamLabel(match.away)
      : (match.note || (card && card.label) || (tab && tab.label) || 'match');
    var description = ((card && card.label) || (match && match.note) || 'PlayOff match') + ' - ' + (edition.dates || '');
    var locationText = matchCalendarLocation(match, edition);
    return '<button class="event-button event-button--match-calendar" type="button" data-calendar-download data-calendar-kind="match"' +
      ' aria-label="' + escapeAttribute('Add to calendar: ' + title) + '"' +
      ' data-calendar-date="' + escapeAttribute(dateValue) + '"' +
      ' data-calendar-time="' + escapeAttribute(timeValue) + '"' +
      ' data-calendar-timezone="' + escapeAttribute((match && match.timezone) || edition.timezone || 'Europe/Zurich') + '"' +
      ' data-calendar-title="' + escapeAttribute(title) + '"' +
      ' data-calendar-description="' + escapeAttribute(description) + '"' +
      ' data-calendar-location="' + escapeAttribute(locationText) + '"' +
      ' data-calendar-filename="' + escapeAttribute((data.slug || 'event') + '-' + edition.year + '-' + calendarFilename(filenameLabel)) + '"' +
      '><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path></svg></button>';
  }

  function renderStageMatches(matches, context) {
    if (!matches || !matches.length) return '';
    context = context || {};
    return '<span class="stage-match-list">' + matches.map(function (match) {
      var calendarButton = renderMatchCalendarButton(context.data, context.edition, context.tab, context.card, match);
      return '<span class="stage-match-row' + (calendarButton ? ' stage-match-row--with-action' : '') + '">' +
        '<time>' + (match.date || 'TBC') + '</time>' +
        '<span class="stage-match-row__teams">' + stageParticipant(match.home) + '<b>' + (match.score || match.time || 'TBC') + '</b>' + stageParticipant(match.away) + '</span>' +
        (match.note ? '<em>' + match.note + '</em>' : '') +
        calendarButton +
      '</span>';
    }).join('') + '</span>';
  }

  function renderConferenceColumns(groups, context) {
    if (!groups || !groups.length) return '';
    context = context || {};
    return '<span class="conference-columns">' + groups.map(function (group) {
      return '<span class="conference-column">' +
        '<span class="conference-column__label">' + (group.label || '') + '</span>' +
        '<strong>' + (group.title || '') + '</strong>' +
        (group.status ? '<em>' + group.status + '</em>' : '') +
        renderStageMatches(group.matches || [], context) +
      '</span>';
    }).join('') + '</span>';
  }

  function renderStageRanking(rows, options) {
    if (!rows || !rows.length) return '';
    options = options || {};
    var nameLabel = options.nameLabel || 'Team';
    var resultLabel = options.resultLabel || 'Place';
    var hideRank = Boolean(options.hideRank);
    var rowClass = 'stage-standing-row stage-standing-row--ranking' + (hideRank ? ' stage-standing-row--no-rank' : '');
    var body = rows.map(function (row) {
      return '<span class="' + rowClass + '">' +
        (hideRank ? '' : '<b>' + (row.rank || '') + '</b>') +
        '<span>' + stageParticipant(row.team) + '</span>' +
        '<strong>' + (row.result || '') + '</strong>' +
      '</span>';
    }).join('');
    return '<span class="stage-standings">' +
      '<span class="' + rowClass + ' stage-standing-row--head">' +
        (hideRank ? '' : '<b>#</b>') +
        '<span>' + nameLabel + '</span><strong>' + resultLabel + '</strong></span>' +
      body +
    '</span>';
  }

  function renderStageRounds(rounds, options) {
    if (!rounds || !rounds.length) return '';
    options = options || {};
    var roundLabel = options.roundLabel || 'Round';
    var fieldLabel = options.fieldLabel || 'Field';
    var advanceLabel = options.advanceLabel || 'Advance';
    var body = rounds.map(function (round) {
      return '<span class="stage-round-row">' +
        '<b>' + (round.label || '') + '</b>' +
        '<span>' + (round.field || '') + '</span>' +
        '<strong>' + (round.advance || '') + '</strong>' +
      '</span>';
    }).join('');
    return '<span class="stage-round-list">' +
      '<span class="stage-round-row stage-round-row--head"><b>' + roundLabel + '</b><span>' + fieldLabel + '</span><strong>' + advanceLabel + '</strong></span>' +
      body +
    '</span>';
  }

  function scoreLabel(value) {
    if (value === null || value === undefined || value === '') return 'TBC';
    var number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    if (number === 0) return 'E';
    var label = Number.isInteger(number)
      ? String(number)
      : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return number > 0 ? '+' + label : label;
  }

  function playerScoresByRound(player, par) {
    if (!player) return [];
    if (Array.isArray(player.toParByRound) && player.toParByRound.length) {
      return player.toParByRound.map(function (value) { return Number(value); });
    }
    if (!Array.isArray(player.scores) || !player.scores.length || !par) return [];
    var total = 0;
    return player.scores.map(function (roundScore, index) {
      total += Number(roundScore);
      return total - (Number(par) * (index + 1));
    });
  }

  function renderScoreProgression(progression) {
    if (!progression) return '';
    var rounds = progression.rounds || ['R1', 'R2', 'R3', 'R4'];
    var players = (progression.players || []).slice(0, progression.limit || 10);
    var note = progression.note || '';
    if (!players.length) {
      return '<span class="score-progression score-progression--empty">' +
        '<span class="score-progression__empty">' + (progression.emptyText || 'Leaderboard graph appears here after Round 1.') + '</span>' +
        (note ? '<span class="score-progression__note">' + note + '</span>' : '') +
      '</span>';
    }

    var series = players.map(function (player, index) {
      return {
        index: index,
        player: player,
        values: playerScoresByRound(player, progression.par)
      };
    }).filter(function (item) {
      return item.values.length >= 1 && item.values.every(function (value) { return Number.isFinite(value); });
    });
    if (!series.length) return '';

    var values = [];
    series.forEach(function (item) {
      values = values.concat(item.values);
    });
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    min -= 1;
    max += 1;

    var width = 760;
    var height = 250;
    var left = 54;
    var right = 18;
    var top = 24;
    var bottom = 42;
    var plotWidth = width - left - right;
    var plotHeight = height - top - bottom;
    var xFor = function (index) {
      return left + (rounds.length <= 1 ? 0 : (plotWidth * index / (rounds.length - 1)));
    };
    var yFor = function (value) {
      return top + ((value - min) / (max - min)) * plotHeight;
    };
    var gridValues = [Math.ceil(min), 0, Math.floor(max)].filter(function (value, index, list) {
      return value >= min && value <= max && list.indexOf(value) === index;
    });
    var grid = gridValues.map(function (value) {
      var y = yFor(value);
      return '<line class="score-progression__grid" x1="' + left + '" y1="' + y.toFixed(1) + '" x2="' + (width - right) + '" y2="' + y.toFixed(1) + '"></line>' +
        '<text class="score-progression__axis-label" x="' + (left - 10) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + scoreLabel(value) + '</text>';
    }).join('');
    var roundLabels = rounds.map(function (label, index) {
      var x = xFor(index);
      return '<text class="score-progression__round-label" x="' + x.toFixed(1) + '" y="' + (height - 12) + '" text-anchor="middle">' + label + '</text>';
    }).join('');
    var lines = series.map(function (item) {
      var points = item.values.map(function (value, index) {
        return xFor(index).toFixed(1) + ',' + yFor(value).toFixed(1);
      }).join(' ');
      var dots = item.values.map(function (value, index) {
        return '<circle cx="' + xFor(index).toFixed(1) + '" cy="' + yFor(value).toFixed(1) + '" r="3.2"></circle>';
      }).join('');
      var winnerClass = item.player.winner || item.index === 0 ? ' score-progression__series--winner' : '';
      return '<g class="score-progression__series score-progression__series--' + (item.index % 10) + winnerClass + '">' +
        '<title>' + (item.player.name || 'Player') + ': ' + item.values.map(scoreLabel).join(', ') + '</title>' +
        '<polyline points="' + points + '"></polyline>' + dots +
      '</g>';
    }).join('');
    var tableRows = series.map(function (item) {
      var finalScore = item.player.final || scoreLabel(item.values[item.values.length - 1]);
      var winnerClass = item.player.winner || item.index === 0 ? ' score-progression__row--winner' : '';
      return '<span class="score-progression__row' + winnerClass + '">' +
        '<span>' + stageParticipant(item.player) + '</span>' +
        item.values.map(function (value) { return '<b>' + scoreLabel(value) + '</b>'; }).join('') +
        '<strong>' + finalScore + '</strong>' +
      '</span>';
    }).join('');
    var tableHead = '<span class="score-progression__row score-progression__row--head"><span>Player</span>' +
      rounds.map(function (round) { return '<b>' + round + '</b>'; }).join('') +
      '<strong>Total</strong></span>';

    return '<span class="score-progression">' +
      '<svg class="score-progression__chart" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeAttribute(progression.ariaLabel || 'Round-by-round leaderboard chart') + '">' +
        grid + roundLabels + lines +
      '</svg>' +
      '<span class="score-progression__table">' + tableHead + tableRows + '</span>' +
      (note ? '<span class="score-progression__note">' + note + '</span>' : '') +
    '</span>';
  }

  function renderFinalSlots(rows) {
    if (!rows || !rows.length) return '';
    var body = rows.map(function (row) {
      return '<span class="final-slot-row">' +
        '<span>' + country(row.team) + '</span>' +
        '<strong>' + (row.from || '') + '</strong>' +
      '</span>';
    }).join('');
    return '<span class="final-slot-table">' +
      '<span class="final-slot-row final-slot-row--head"><span>Qualified team</span><strong>From</strong></span>' +
      body +
    '</span>';
  }

  function renderStageCountryGroups(groups) {
    if (!groups || !groups.length) return '';
    return '<span class="stage-country-groups">' + groups.map(function (group) {
      var teams = (group.teams || []).map(country).join(' ');
      return '<span class="stage-country-group">' +
        '<b>' + (group.label || '') + '</b>' +
        '<span class="stage-country-group__teams">' + teams + '</span>' +
        (group.note ? '<em>' + group.note + '</em>' : '') +
      '</span>';
    }).join('') + '</span>';
  }

  function stageCard(item, data, edition, tab) {
    if (!item) return '';
    var className = item.className ? ' ' + item.className : '';
    var detail = item.type === 'standings'
      ? renderStageStandings(item.rows || [])
      : item.type === 'matches'
        ? renderStageMatches(item.matches || [], { data: data, edition: edition, tab: tab, card: item })
        : item.type === 'conference-columns'
          ? renderConferenceColumns(item.groups || [], { data: data, edition: edition, tab: tab, card: item })
          : item.type === 'final-slots'
            ? renderFinalSlots(item.rows || [])
            : item.type === 'ranking'
              ? renderStageRanking(item.rows || [], { nameLabel: item.nameLabel, resultLabel: item.resultLabel, hideRank: item.hideRank })
              : item.type === 'rounds'
                ? renderStageRounds(item.rounds || [], { roundLabel: item.roundLabel, fieldLabel: item.fieldLabel, advanceLabel: item.advanceLabel })
              : item.type === 'score-progression'
                ? renderScoreProgression(item.progression || item)
              : item.type === 'country-groups'
                ? renderStageCountryGroups(item.groups || [])
                : (item.detail || '');
    return '<div class="stage-card' + className + '">' +
      '<span>' + (item.label || '') + '</span>' +
      (item.title ? '<strong>' + item.title + '</strong>' : '') +
      (detail ? '<p>' + detail + '</p>' : '') +
    '</div>';
  }

  function renderStageTabs(data, edition) {
    var tabs = edition.stageTabs || [];
    if (!tabs.length) return '';
    var defaultId = edition.defaultStageTab || tabs[0].id;
    var hasMultipleTabs = tabs.length > 1;
    var controls = hasMultipleTabs ? tabs.map(function (tab) {
      var active = tab.id === defaultId;
      return '<button class="event-stage-tab" id="stage-' + edition.year + '-' + tab.id + '-tab" type="button" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" data-stage-tab="' + tab.id + '" aria-controls="stage-' + edition.year + '-' + tab.id + '">' + tab.label + '</button>';
    }).join('') : '';
    var panels = tabs.map(function (tab) {
      var active = tab.id === defaultId;
      var header = hasMultipleTabs && (tab.title || tab.summary)
        ? '<div class="event-stage-panel__header">' +
            (tab.label ? '<span>' + tab.label + '</span>' : '') +
            (tab.title ? '<strong>' + tab.title + '</strong>' : '') +
            (tab.summary ? '<p>' + tab.summary + '</p>' : '') +
          '</div>'
        : '';
      return '<div class="event-stage-panel' + (active ? ' is-active' : '') + '" id="stage-' + edition.year + '-' + tab.id + '" role="tabpanel"' + (hasMultipleTabs ? ' aria-labelledby="stage-' + edition.year + '-' + tab.id + '-tab"' : '') + (active ? '' : ' hidden') + '>' +
        header +
        '<div class="stage-card-grid">' + (tab.cards || []).map(function (card) {
          return stageCard(card, data, edition, tab);
        }).join('') + '</div>' +
      '</div>';
    }).join('');
    return '<section class="event-stage-tabs' + (hasMultipleTabs ? '' : ' event-stage-tabs--single') + '" data-stage-tabs aria-label="Edition stage details">' +
      (hasMultipleTabs ? '<div class="event-stage-tablist" role="tablist" aria-label="Group Stage and PlayOff">' + controls + '</div>' : '') +
      '<div class="event-stage-panels">' + panels + '</div>' +
    '</section>';
  }

  function bindStageTabs(root) {
    (root || document).querySelectorAll('[data-stage-tabs]').forEach(function (tabsRoot) {
      var buttons = Array.prototype.slice.call(tabsRoot.querySelectorAll('[data-stage-tab]'));
      var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll('.event-stage-panel[id]'));
      function activate(id, focusButton) {
        buttons.forEach(function (button) {
          var active = button.getAttribute('data-stage-tab') === id;
          button.setAttribute('aria-selected', active ? 'true' : 'false');
          button.tabIndex = active ? 0 : -1;
          if (active && focusButton) button.focus();
        });
        panels.forEach(function (panel) {
          var active = panel.id === 'stage-' + id || panel.id.slice(panel.id.lastIndexOf('-') + 1) === id;
          if (!active) active = panel.id.indexOf('-' + id) >= 0;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activate(button.getAttribute('data-stage-tab'), false);
        });
        button.addEventListener('keydown', function (event) {
          var currentIndex = buttons.indexOf(button);
          var nextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
          var prevKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
          if (!nextKey && !prevKey && event.key !== 'Home' && event.key !== 'End') return;
          event.preventDefault();
          var nextIndex = currentIndex;
          if (nextKey) nextIndex = (currentIndex + 1) % buttons.length;
          if (prevKey) nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = buttons.length - 1;
          activate(buttons[nextIndex].getAttribute('data-stage-tab'), true);
        });
      });
      var selected = buttons.find(function (button) { return button.getAttribute('aria-selected') === 'true'; }) || buttons[0];
      if (selected) activate(selected.getAttribute('data-stage-tab'), false);
    });
  }

  function initStaticStageTabs() {
    bindStageTabs(document);
  }

  function renderEditionWithStages(data, edition, target) {
    var editionCountries = edition.countries || [];
    var editionCities = edition.cities || [];
    var countryHtml = data.hideEditionCountryFact
      ? ''
      : (edition.countryFact ? fact('Country', edition.countryFact) : countryFact(editionCountries));
    var overviewCards = (edition.overviewCards || []).map(compactCard).join('');
    var overview = overviewCards
      ? '<div class="edition-overview"><div class="edition-overview__cards">' + overviewCards + '</div></div>'
      : '';
    var weatherCard = renderWeatherCard(data, edition);
    var questionBlocks = data.showStageQuestions ? (edition.questions || []).map(question).join('') : '';
    var questions = questionBlocks ? '<div class="question-grid">' + questionBlocks + '</div>' : '';
    var stageTabs = renderStageTabs(data, edition);
    var editionContent = data.templateMode === 'history'
      ? stageTabs + questions
      : questions + stageTabs;
    var actions = editionActionButtons(data, edition, !shouldSuppressEditionCalendar(data));
    var historyNotice = edition.historyNotice ? highlight(edition.historyNotice) : '';

    target.innerHTML =
      '<div class="facts-strip facts-strip--edition">' +
        countryHtml +
        fact('City', editionCities.map(city).join(' ') || 'TBC') +
        fact('Venue', edition.venue) +
        fact('Dates', edition.dates) +
        (data.hideEditionFormatFact ? '' : fact('Format', edition.format)) +
      '</div>' +
      historyNotice +
      overview +
      weatherCard +
      editionContent +
      actions +
    sourceCard(data);

    bindStageTabs(target);
    removeBrokenCountryHeroImages(target);
    hydrateWeatherCards(target);
    bindCalendar(data, edition);
    bindSaveButtons();
    bindLeadForms();
    hydrateSessionScoreBars(target);
    refreshCountdowns();
  }

  function renderEdition(data, year) {
    var edition = data.editions.find(function (item) { return String(item.year) === String(year); }) || data.editions[0];
    var target = document.querySelector('[data-year-edition]');
    var heading = document.querySelector('[data-year-heading]');
    if (!target || !edition) return;
    if (heading) heading.textContent = data.eventName + ' ' + edition.year + ' ' + edition.headingPlace;
    document.querySelectorAll('[data-year-title]').forEach(function (node) {
      node.textContent = edition.h1 || (data.eventName + ' ' + edition.year);
    });
    var editionCountries = edition.countries || [];
    var editionCities = edition.cities || [];
    var countryHtml = data.hideEditionCountryFact
      ? ''
      : (edition.countryFact ? fact('Country', edition.countryFact) : countryFact(editionCountries));

    if (edition.stageTabs && edition.stageTabs.length) {
      renderEditionWithStages(data, edition, target);
      return;
    }

    if (data.slug === 'ryder-cup') {
      renderRyderTabs(data, edition, target);
      updateEditionIdentity(data, edition);
      removeBrokenCountryHeroImages(target);
      bindCalendar(data, edition);
      bindSaveButtons();
      bindLeadForms();
      bindEditionTabTargetLinks();
      hydrateSessionScoreBars(target);
      hydrateRyderLiveResults(target);
      refreshCountdowns();
      return;
    }

    var countdownTarget = edition.countdownDate || edition.startDate;
    var countdownLabel = edition.countdownLabel || 'Event starts';
    var lifecycleLabel = edition.lifecycleLabel || 'Result';
    var resultTitle = edition.winner ? country(edition.winner) : (edition.resultLabel || '');
    var pastHasSpecificResult = edition.winner || (!!edition.result && !isPlaceholderText(edition.result));
    var lifecycle = edition.status === 'past'
      ? pastHasSpecificResult
        ? '<div class="card"><span>' + lifecycleLabel + '</span><strong>' + (resultTitle || 'Confirmed result') + '</strong><p>' + edition.result + '</p></div>'
        : ''
      : edition.status === 'ongoing'
        ? '<div class="countdown countdown--live"><span>In progress</span><strong>' + (edition.liveLabel || 'Live now') + '</strong><p>' + edition.countdownText + '</p></div>'
        : '<div class="countdown" data-countdown="' + countdownTarget + '" data-next-date="' + (edition.nextDate || '') + '"><span>' + countdownLabel + '</span><strong>' + daysText(countdownTarget, edition.nextDate) + '</strong><p>' + edition.countdownText + '</p></div>';

    var questionBlocks = (edition.questions || []).map(question).join('');
    var hasScoreProgression = !!(edition.scoreProgression && ((edition.scoreProgression.players || []).length || edition.scoreProgression.note));
    var highlightBlocks = hasScoreProgression && edition.status === 'past'
      ? ''
      : (edition.highlights || []).filter(function (item) {
        return edition.status !== 'past' || !isPlaceholderArchive(item);
      }).map(highlight).join('');
    var editionBlocks = edition.status === 'past'
      ? highlightBlocks
      : (questionBlocks || highlightBlocks);
    var finalResults = edition.status === 'past' && edition.finalStandings
      ? '<div class="card card--standings"><span>Top results</span><strong>Top finishers</strong>' + standingRows(edition.finalStandings) + '</div>'
      : '';
    var scoreProgressionMarkup = edition.scoreProgression ? renderScoreProgression(edition.scoreProgression) : '';
    var scoreProgressionCard = scoreProgressionMarkup
      ? '<div class="stage-card stage-card--wide stage-card--leaderboard-chart"><span>Leaderboard</span><strong>Round progression</strong><p>' + scoreProgressionMarkup + '</p></div>'
      : '';
    var medalGames = edition.status === 'past' && edition.medalGames
      ? '<div class="card card--standings"><span>Medal games</span><strong>Results</strong>' + resultRows(edition.medalGames) + '</div>'
      : '';

    var editionDetails = editionBlocks ? '<div class="question-grid">' + editionBlocks + '</div>' : '';
    var weatherCard = renderWeatherCard(data, edition);
    var actions = editionActionButtons(data, edition, true);
    var historyNotice = edition.historyNotice ? highlight(edition.historyNotice) : '';
    var currentModules = renderCurrentEditionModules(edition);
    var historicalCta = edition.status === 'past' ? renderHistoricalCurrentCta(edition) : '';

    target.innerHTML =
      '<div class="facts-strip">' +
        countryHtml +
        fact('City', editionCities.map(city).join(' ') || 'TBC') +
        fact('Venue', edition.venue) +
        fact('Dates', edition.dates) +
        fact('Status', edition.statusLabel) +
        (data.hideEditionFormatFact ? '' : fact('Format', edition.format)) +
      '</div>' +
      historyNotice +
      currentModules +
      lifecycle +
      scoreProgressionCard +
      finalResults +
      medalGames +
      weatherCard +
      historicalCta +
      editionDetails +
      actions +
    sourceCard(data);

    removeBrokenCountryHeroImages(target);
    hydrateWeatherCards(target);
    bindCalendar(data, edition);
    bindSaveButtons();
    bindLeadForms();
    hydrateSessionScoreBars(target);
    hydrateRyderLiveResults(target);
    refreshCountdowns();
  }

  function initYearSwitcher() {
    var data = readJson('event-year-data');
    var switcher = document.querySelector('[data-year-switcher]');
    if (!data || !switcher) return;
    setEventTeamIcons(data);

    var switcherEditions = data.editions.slice().sort(function (a, b) {
      return Number(a.year) - Number(b.year);
    });
    var keepSingleSwitcher = document.body && document.body.classList.contains('event-page--framed');
    if ((switcherEditions.length <= 1 && !keepSingleSwitcher) || data.hideYearSwitcher) {
      switcher.hidden = true;
    }
    function requestedYearFromLocation() {
      var hashMatch = (window.location.hash || '').match(/^#year-(\d{4})$/);
      var queryYear = data.hashOnlyYearNavigation ? null : new URLSearchParams(window.location.search).get('year');
      var year = hashMatch ? hashMatch[1] : queryYear;
      return switcherEditions.some(function (edition) { return String(edition.year) === String(year); })
        ? Number(year)
        : data.defaultYear;
    }

    function labelFor(edition) {
      return edition.year + (edition.year === data.defaultYear && edition.status !== 'past' ? ' current' : '');
    }

    function ariaLabelFor(edition) {
      return labelFor(edition) + (edition.winner && edition.winner.name ? ', winner ' + edition.winner.name : '');
    }

    function yearHashUrl(year) {
      return (window.location.pathname || '') + '#year-' + year;
    }

    function buttonContentFor(edition) {
      var winner = edition.winner || {};
      var winnerImage = winner.icon || winner.flag;
      var winnerFlag = winnerImage
        ? '<img class="year-button__flag year-button__winner-icon" src="' + escapeAttribute(winnerImage) + '" alt="" width="20" height="14" aria-hidden="true" title="Winner: ' + escapeAttribute(winner.name || '') + '">'
        : '';
      return '<span class="year-button__year">' + labelFor(edition) + '</span>' + winnerFlag;
    }

    function selectYear(year) {
      switcher.querySelectorAll('[data-year]').forEach(function (item) {
        var active = String(item.getAttribute('data-year')) === String(year);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
        var edition = switcherEditions.find(function (candidate) {
          return String(candidate.year) === String(item.getAttribute('data-year'));
        });
        if (edition) {
          item.setAttribute('aria-label', ariaLabelFor(edition));
          item.innerHTML = buttonContentFor(edition);
        }
      });
      try {
        renderEdition(data, year);
      } catch (error) {
        window.__eventRenderErrors = window.__eventRenderErrors || [];
        window.__eventRenderErrors.push(String(error && error.message ? error.message : error));
      }
    }

    var requestedYear = requestedYearFromLocation();

    switcher.innerHTML = switcherEditions.map(function (edition) {
      var pressed = edition.year === requestedYear ? 'true' : 'false';
      return '<button class="year-button" type="button" aria-pressed="' + pressed + '" data-year="' + edition.year + '" aria-label="' + escapeAttribute(ariaLabelFor(edition)) + '">' + buttonContentFor(edition) + '</button>';
    }).join('');

    switcher.addEventListener('click', function (event) {
      var button = event.target.closest('[data-year]');
      if (!button) return;
      var year = button.getAttribute('data-year');
      selectYear(year);
      if (data.hashOnlyYearNavigation) {
        if (history.replaceState) history.replaceState(null, '', yearHashUrl(year));
        else window.location.hash = 'year-' + year;
      } else if (history.replaceState) {
        history.replaceState(null, '', '#year-' + year);
      }
    });

    selectYear(requestedYear);
    if (data.hashOnlyYearNavigation && (window.location.search || !/^#year-\d{4}$/.test(window.location.hash || ''))) {
      if (history.replaceState) history.replaceState(null, '', yearHashUrl(requestedYear));
      else window.location.hash = 'year-' + requestedYear;
    }
    window.addEventListener('hashchange', function () {
      var nextYear = requestedYearFromLocation();
      if (String(nextYear) !== String(requestedYear)) {
        requestedYear = nextYear;
        selectYear(nextYear);
      }
    });
  }

  function markResultWinners(html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    // Reverse order of matches inside each results group so the most
    // recent date (today's matches when ongoing) appears at the top.
    wrapper.querySelectorAll('.match-results').forEach(function (group) {
      var matches = [];
      var child = group.firstElementChild;
      while (child) {
        if (child.classList && child.classList.contains('match-result')) matches.push(child);
        child = child.nextElementSibling;
      }
      for (var i = matches.length - 1; i >= 0; i--) group.appendChild(matches[i]);
    });

    // Mark the winning side.
    wrapper.querySelectorAll('.match-result').forEach(function (row) {
      var score = row.querySelector('.match-score');
      var teams = row.querySelectorAll('.country');
      if (!score || teams.length < 2) return;
      var text = score.textContent || '';
      var values = text.match(/\d+/g);
      if (!values || values.length < 2) return;
      var home = Number(values[0]);
      var away = Number(values[1]);
      if (home === away) return;
      teams[home > away ? 0 : 1].classList.add('country--winner');
    });
    return wrapper.innerHTML;
  }

  function partArticle(part) {
    var facts = (part.facts || []).map(function (item) {
      return fact(item.label, item.value);
    }).join('');
    var factsStrip = facts ? '<div class="facts-strip">' + facts + '</div>' : '';

    var blocks = (part.blocks || []).map(function (item) {
      var className = item.className ? ' ' + item.className : '';
      var detail = item.groupPanels ? groupPanels(item.groupPanels, item.note) : (item.upcomingGroups ? upcomingTabs(item.upcomingGroups, item.note) : (item.upcomingMatches ? upcomingRows(item.upcomingMatches, item.note) : (item.matches ? matchRows(item.matches, item.note) : item.detail)));
      detail = item.className && item.className.indexOf('part-card--results') >= 0 ? markResultWinners(detail) : detail;
      return '<div class="part-card' + className + '">' +
        '<span>' + item.label + '</span>' +
        '<strong>' + item.title + '</strong>' +
        '<p>' + detail + '</p>' +
      '</div>';
    }).join('');

    return (
      '<article class="part-page" data-current-part="' + part.id + '">' +
        '<div class="part-page__header">' +
          '<span>Sub event</span>' +
          '<h3>' + part.title + '</h3>' +
          '<p>' + part.summary + '</p>' +
        '</div>' +
        factsStrip +
        '<div class="part-page__grid">' + blocks + '</div>' +
      '</article>'
    );
  }

  function hydratePartInteractions(target) {
    enhanceF1Cards(target);

    target.querySelectorAll('.upcoming-tabs').forEach(function (tabs) {
      tabs.addEventListener('click', function (event) {
        var button = event.target.closest('[data-upcoming-tab]');
        if (!button) return;
        var card = button.closest('.part-card');
        if (!card) return;
        var id = button.getAttribute('data-upcoming-tab');
        card.querySelectorAll('[data-upcoming-tab]').forEach(function (item) {
          item.setAttribute('aria-selected', item === button ? 'true' : 'false');
        });
        card.querySelectorAll('[data-upcoming-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-upcoming-panel') !== id;
        });
      });
    });

    target.querySelectorAll('.group-filter__controls').forEach(function (controls) {
      controls.addEventListener('click', function (event) {
        var button = event.target.closest('[data-group-panel-button]');
        if (!button) return;
        var card = button.closest('.part-card');
        if (!card) return;
        var id = button.getAttribute('data-group-panel-button');
        card.querySelectorAll('[data-group-panel-button]').forEach(function (item) {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        card.querySelectorAll('[data-group-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-group-panel') !== id;
        });
      });
    });

    target.querySelectorAll('.follow-team').forEach(function (picker) {
      picker.addEventListener('click', function (event) {
        var button = event.target.closest('[data-follow-team]');
        if (!button) return;
        event.preventDefault();
        var team = normalizeTeamName(button.getAttribute('data-follow-team'));
        var followed = readFollowedTeams();
        if (followed.indexOf(team) >= 0) {
          followed = followed.filter(function (item) { return item !== team; });
        } else {
          followed.push(team);
        }
        writeFollowedTeams(followed);
        applyFollowedTeams(target);
      });
    });

    applyFollowedTeams(target);
  }

  function renderPart(data, id) {
    var parts = data.parts || [];
    var part = parts.find(function (item) { return item.id === id; }) || parts[0];
    var target = document.querySelector('[data-part-detail]');
    if (!target || !part) return;

    target.classList.remove('part-detail--stacked');
    target.innerHTML = partArticle(part);
    hydratePartInteractions(target);
  }

  function renderAllParts(data) {
    var parts = data.parts || [];
    var target = document.querySelector('[data-part-detail]');
    if (!target || !parts.length) return;

    target.classList.add('part-detail--stacked');
    target.innerHTML = parts.map(function (part) {
      return partArticle(part);
    }).join('');
    hydratePartInteractions(target);
  }

  function initPartSwitcher() {
    var data = readJson('event-part-data');
    var eventData = readJson('event-year-data');
    var switcher = document.querySelector('[data-part-switcher]');
    var target = document.querySelector('[data-part-detail]');
    if (!data || !target || !data.parts || !data.parts.length) return;

    mergeExternalPartBlocks(data, function (mergedData) {
      if (eventData && eventData.templateMode === 'history') {
        if (switcher) {
          switcher.hidden = true;
          switcher.innerHTML = '';
        }
        renderAllParts(mergedData);
        return;
      }

      if (!switcher) return;
      var defaultPart = mergedData.defaultPart || mergedData.parts[0].id;
      switcher.innerHTML = mergedData.parts.map(function (part) {
        var pressed = part.id === defaultPart ? 'true' : 'false';
        return '<button class="year-button part-button" type="button" aria-pressed="' + pressed + '" data-part="' + part.id + '">' + part.label + '</button>';
      }).join('');

      switcher.addEventListener('click', function (event) {
        var button = event.target.closest('[data-part]');
        if (!button) return;
        switcher.querySelectorAll('[data-part]').forEach(function (item) {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        renderPart(mergedData, button.getAttribute('data-part'));
      });

      renderPart(mergedData, defaultPart);
    });
  }

  function refreshCountdowns() {
    document.querySelectorAll('[data-countdown]').forEach(function (node) {
      var strong = node.querySelector('strong');
      if (strong) strong.textContent = daysText(node.getAttribute('data-countdown'), node.getAttribute('data-next-date'));
    });
  }

  function bindCalendar(data, edition) {
    document.querySelectorAll('[data-calendar-download]').forEach(function (button) {
      button.onclick = function () {
        var isMatchCalendar = button.getAttribute('data-calendar-kind') === 'match';
        var timezone = button.getAttribute('data-calendar-timezone') || 'Europe/Zurich';
        var title = isMatchCalendar
          ? button.getAttribute('data-calendar-title')
          : data.eventName + ' ' + edition.year;
        var description = isMatchCalendar
          ? button.getAttribute('data-calendar-description')
          : edition.calendarDescription;
        var url = location.href.split('#')[0] + '#year';
        var filename = isMatchCalendar
          ? button.getAttribute('data-calendar-filename')
          : data.slug + '-' + edition.year;
        var startLine;
        var endLine;

        if (isMatchCalendar) {
          var matchDate = button.getAttribute('data-calendar-date');
          var matchTime = button.getAttribute('data-calendar-time');
          var startDateTime = addMinutesToDateTime(matchDate, matchTime, 0);
          var endDateTime = addMinutesToDateTime(matchDate, matchTime, 180);
          if (!startDateTime || !endDateTime) return;
          startLine = 'DTSTART;TZID=' + timezone + ':' + startDateTime;
          endLine = 'DTEND;TZID=' + timezone + ':' + endDateTime;
        } else {
          if (!edition.startDate || !edition.endExclusive) return;
          startLine = 'DTSTART;VALUE=DATE:' + edition.startDate.replace(/-/g, '');
          endLine = 'DTEND;VALUE=DATE:' + edition.endExclusive.replace(/-/g, '');
        }

        var ics = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//OneSliders//' + data.eventName + '//EN',
          'BEGIN:VEVENT',
          'UID:' + filename + '@one-sliders.com',
          'DTSTAMP:' + calendarStamp(),
          startLine,
          endLine,
          'SUMMARY:' + escapeIcs(title),
          'DESCRIPTION:' + escapeIcs(description),
          (isMatchCalendar && button.getAttribute('data-calendar-location') ? 'LOCATION:' + escapeIcs(button.getAttribute('data-calendar-location')) : ''),
          'URL:' + escapeIcs(url),
          'END:VEVENT',
          'END:VCALENDAR'
        ].filter(Boolean).join('\r\n');
        var blob = new Blob([ics], { type: 'text/calendar' });
        var blobUrl = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename + '.ics';
        link.click();
        URL.revokeObjectURL(blobUrl);
      };
    });
  }

  function readSaved() {
    try { return JSON.parse(localStorage.getItem(savedKey) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function writeSaved(value) {
    try { localStorage.setItem(savedKey, JSON.stringify(value)); }
    catch (error) { return; }
  }

  function bindSaveButtons() {
    document.querySelectorAll('[data-save-event]').forEach(function (button) {
      var id = button.getAttribute('data-save-event');
      var label = button.getAttribute('data-save-label') || 'Save';
      var savedLabel = button.getAttribute('data-saved-label') || 'Saved';
      function paint() {
        var active = !!readSaved()[id];
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.textContent = active ? savedLabel : label;
      }
      button.onclick = function () {
        var saved = readSaved();
        if (saved[id]) delete saved[id];
        else saved[id] = { title: document.title, savedAt: new Date().toISOString() };
        writeSaved(saved);
        paint();
      };
      paint();
    });
  }

  function bindLeadForms() {
    document.querySelectorAll('[data-event="lead_capture"]').forEach(function (form) {
      form.onsubmit = function (event) {
        event.preventDefault();
      };
    });
  }

  function hydrateSessionScoreBars(root) {
    (root || document).querySelectorAll('[data-score-width]').forEach(function (bar) {
      var width = Math.max(4, Math.min(96, Number(bar.getAttribute('data-score-width')) || 4));
      bar.style.setProperty('--score-width', width + '%');
    });
  }

  function renderLiveSessions(sessions) {
    return (sessions || []).map(function (session) {
      var score = session.europe || session.usa ? (session.europe || '0') + ' - ' + (session.usa || '0') : 'TBC';
      var matches = (session.matches || []).slice(0, 4).map(function (match) {
        return '<span class="live-match-row"><b>' + (match.match || match.label || 'Match') + '</b><span>' + (match.europe || 'Europe TBC') + '</span><strong>' + (match.score || match.status || 'TBC') + '</strong><span>' + (match.usa || 'USA TBC') + '</span></span>';
      }).join('');
      return '<div class="live-session-row live-session-row--expanded"><span>' + (session.label || 'Session') + '</span><strong>' + score + '</strong><em>' + (session.status || 'TBC') + '</em>' + (matches ? '<div class="live-match-list">' + matches + '</div>' : '') + '</div>';
    }).join('');
  }

  function hydrateRyderLiveResults(root) {
    (root || document).querySelectorAll('[data-ryder-live-results]').forEach(function (panel) {
      var src = panel.getAttribute('data-live-src');
      if (!src || !window.fetch) return;
      fetch(src, { cache: 'no-cache' })
        .then(function (response) {
          if (!response.ok) throw new Error('Could not load Ryder Cup live data');
          return response.json();
        })
        .then(function (live) {
          var europeTotal = panel.querySelector('[data-live-total="europe"]');
          var usaTotal = panel.querySelector('[data-live-total="usa"]');
          var currentSession = panel.querySelector('[data-live-current-session]');
          var status = panel.querySelector('[data-live-status]');
          var list = panel.querySelector('[data-live-session-list]');
          var updated = panel.querySelector('[data-live-updated]');
          if (europeTotal && live.totals && live.totals.europe !== '') europeTotal.textContent = live.totals.europe;
          if (usaTotal && live.totals && live.totals.usa !== '') usaTotal.textContent = live.totals.usa;
          if (currentSession) currentSession.textContent = live.currentSession || (live.status === 'not-live-yet' ? 'Not live yet' : 'TBC');
          if (status) status.textContent = live.status === 'not-live-yet' ? 'Ryder Cup 2027 is not live yet. This panel becomes the live score hub during event week.' : 'Live and completed session results appear here as the event is updated.';
          if (list && live.sessions && live.sessions.length) list.innerHTML = renderLiveSessions(live.sessions);
          if (updated) updated.textContent = live.updated ? 'Last updated: ' + live.updated : 'Not live yet.';
        })
        .catch(function () {
          var status = panel.querySelector('[data-live-status]');
          if (status) status.textContent = 'Live data is not available right now. Check official Ryder Cup scoring during event play.';
        });
    });
  }

  function bindEditionTabs(root) {
    (root || document).querySelectorAll('[data-edition-tabs]').forEach(function (tabsRoot) {
      var buttons = Array.prototype.slice.call(tabsRoot.querySelectorAll('[data-edition-tab]'));
      var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll('[data-edition-tab-panel]'));
      function activate(id, focusButton) {
        buttons.forEach(function (button) {
          var active = button.getAttribute('data-edition-tab') === id;
          button.setAttribute('aria-selected', active ? 'true' : 'false');
          button.tabIndex = active ? 0 : -1;
          if (active && focusButton) button.focus();
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-edition-tab-panel') !== id;
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activate(button.getAttribute('data-edition-tab'), false);
        });
        button.addEventListener('keydown', function (event) {
          var currentIndex = buttons.indexOf(button);
          var nextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
          var prevKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
          if (!nextKey && !prevKey && event.key !== 'Home' && event.key !== 'End') return;
          event.preventDefault();
          var nextIndex = currentIndex;
          if (nextKey) nextIndex = (currentIndex + 1) % buttons.length;
          if (prevKey) nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = buttons.length - 1;
          activate(buttons[nextIndex].getAttribute('data-edition-tab'), true);
        });
      });
      tabsRoot.addEventListener('click', function (event) {
        var link = event.target.closest('[data-edition-tab-target]');
        if (!link) return;
        window.__eventPendingTab = link.getAttribute('data-edition-tab-target');
      });
      var selected = buttons.find(function (button) { return button.getAttribute('aria-selected') === 'true'; }) || buttons[0];
      if (selected) activate(selected.getAttribute('data-edition-tab'), false);
    });
  }

  function bindEditionTabTargetLinks() {
    document.querySelectorAll('[data-edition-tab-target]').forEach(function (link) {
      link.addEventListener('click', function () {
        var tabId = link.getAttribute('data-edition-tab-target');
        window.__eventPendingTab = tabId;
        window.requestAnimationFrame(function () {
          var button = document.querySelector('[data-edition-tab="' + tabId + '"]');
          if (button && button.getAttribute('aria-selected') !== 'true') button.click();
        });
      });
    });
  }

  function initCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    var track = carousel.querySelector('[data-carousel-track]');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var prevButton = carousel.querySelector('[data-carousel-prev]');
    var nextButton = carousel.querySelector('[data-carousel-next]');
    var dots = carousel.querySelector('[data-carousel-dots]');
    var labels = { general: 'General', year: 'Year', parts: 'Parts' };
    var index = 0;
    var touchStartX = 0;
    var touchStartY = 0;

    if (!track || !slides.length) return;

    if (dots) {
      dots.innerHTML = slides.map(function (slide, slideIndex) {
        var key = slide.getAttribute('data-slide') || slide.id || ('Slide ' + (slideIndex + 1));
        var label = labels[key] || key;
        return '<button type="button" data-carousel-dot="' + slideIndex + '" aria-label="Show ' + label + '">' + label + '</button>';
      }).join('');
    }

    function slideIndexFromHash() {
      var id = window.location.hash ? window.location.hash.slice(1) : '';
      id = id.replace(/^year-\d{4}$/, 'year');
      var found = slides.findIndex(function (slide) { return slide.id === id; });
      return found >= 0 ? found : 0;
    }

    function resetScroll() {
      carousel.scrollLeft = 0;
      track.scrollLeft = 0;
      window.scrollTo(0, 0);
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }

    function paint(keepHash) {
      var width = carousel.getBoundingClientRect().width || window.innerWidth || document.documentElement.clientWidth;
      track.style.transform = 'translate3d(-' + (index * width) + 'px, 0, 0)';
      resetScroll();
      window.requestAnimationFrame(resetScroll);
      if (prevButton) prevButton.hidden = index === 0;
      if (nextButton) nextButton.hidden = index === slides.length - 1;
      if (dots) {
        dots.querySelectorAll('[data-carousel-dot]').forEach(function (button, dotIndex) {
          button.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
        });
      }
      if (!keepHash && slides[index] && history.replaceState) {
        history.replaceState(null, '', '#' + slides[index].id);
      }
    }

    function goTo(nextIndex, keepHash) {
      index = Math.max(0, Math.min(slides.length - 1, nextIndex));
      paint(keepHash);
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        goTo(index - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        goTo(index + 1);
      });
    }

    if (dots) {
      dots.addEventListener('click', function (event) {
        var button = event.target.closest('[data-carousel-dot]');
        if (!button) return;
        goTo(Number(button.getAttribute('data-carousel-dot')) || 0);
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href').slice(1);
        var found = slides.findIndex(function (slide) { return slide.id === id; });
        if (found < 0) return;
        event.preventDefault();
        goTo(found);
      });
    });

    window.addEventListener('hashchange', function () {
      goTo(slideIndexFromHash(), true);
    });

    window.addEventListener('resize', function () {
      paint(true);
    });

    document.addEventListener('keydown', function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(event.target.tagName)) return;
      if (event.key === 'ArrowRight') goTo(index + 1);
      if (event.key === 'ArrowLeft') goTo(index - 1);
    });

    carousel.addEventListener('touchstart', function (event) {
      if (!event.touches || !event.touches.length) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchend', function (event) {
      if (!event.changedTouches || !event.changedTouches.length) return;
      var dx = event.changedTouches[0].clientX - touchStartX;
      var dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      goTo(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    track.style.transition = 'none';
    goTo(slideIndexFromHash(), true);
    window.requestAnimationFrame(function () {
      track.style.transition = '';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureSingleFooter();
    initCarousel();
    initYearSwitcher();
    initPartSwitcher();
    initStaticStageTabs();
    refreshCountdowns();
    bindSaveButtons();
    bindLeadForms();
    bindEditionTabTargetLinks();
    hydrateSessionScoreBars(document);
    hydrateRyderLiveResults(document);
    window.setInterval(refreshCountdowns, 1000);
  });
}());

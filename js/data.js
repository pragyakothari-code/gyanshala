(function () {
  'use strict';

  /* ── Config — fill in when school provides credentials ────────── */
  var CONFIG = {
    sheetId: '',   /* e.g. '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms' */
    apiKey:  '',   /* e.g. 'AIzaSy...' */
    range:   'Sheet1!A2:F'
  };

  var FALLBACK_URL = 'content.json';

  /* ── Schedule (mirrors sol-yoga.js) — for computing due dates ─── */
  var SCHEDULE = [
    '2025-09-07', '2025-09-14', '2025-09-28', '2025-10-12',
    '2025-11-02', '2025-11-16', '2025-12-07', '2025-12-14',
    '2026-01-04', '2026-01-18', '2026-02-01', '2026-02-15',
    '2026-03-01', '2026-03-15', '2026-03-29', '2026-04-12',
    '2026-04-26', '2026-05-03', '2026-05-17'
  ];

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  /* Return "Month D, YYYY" for the next class after a given YYYY-MM-DD */
  function nextClassLabel(ymd) {
    var idx = SCHEDULE.indexOf(ymd);
    if (idx < 0 || idx >= SCHEDULE.length - 1) return '';
    var next = SCHEDULE[idx + 1];
    var p = next.split('-');
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }

  /* ── Inline data (mirrors content.json / schedule.js INLINE_DATA)
     Works on file:// where fetch() is blocked.
     Keep in sync with schedule.js whenever content changes.        */
  var INLINE_DATA = [
    ["2025-09-07", "Jainism · Charitra",  "Year 2 — Chapter 1",                    "Read Chapter 1 and be ready to discuss in class.", "", ""],
    ["2025-09-07", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-09-07", "Yoga · all",          "Yoga Week",                              "", "", ""],

    ["2025-09-14", "Jainism · Darshan",   "Gati, Leshya, and Parshavnath's Story",  "Explain what is Leshya and name all the types. Read chapter 16 about Prabhu Parshavnath's life for group discussion.", "", ""],
    ["2025-09-14", "Jainism · Charitra",  "Chapter 2",                              "Research arguments for or against the idea that Jain religion is part of Hinduism. Give three points why one should follow religious activity.", "", ""],
    ["2025-09-14", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-09-14", "SOL · all",           "SOL Week",                               "", "", ""],

    ["2025-09-28", "Jainism · Darshan",   "Introduction to Shravak and 5 Anuvratas","Learn the names of leshya and the five Anuvratas.", "", ""],
    ["2025-09-28", "Jainism · Charitra",  "Punya and Paap",                         "Keep a daily log recording at least one Shubh Bhav, one Ashubh Bhav, and one Shuddh Bhav.", "", ""],
    ["2025-09-28", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-09-28", "Yoga · all",          "Yoga Week",                              "", "", ""],

    ["2025-10-12", "Hindi · Advanced",    "Kriya ke Prakar — Kinds of Verb (page 180)", "Complete Exercise 10 on page 181.", "", ""],
    ["2025-10-12", "SOL · all",           "SOL Week",                               "", "", ""],

    ["2025-11-02", "Jainism · Charitra",  "Samayik",                                "Do one Samayik before next class.", "", ""],
    ["2025-11-02", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-11-02", "Yoga · all",          "Yoga Week",                              "", "", ""],

    ["2025-11-16", "Jainism · Charitra",  "Samvaay",                                "Read the chapter. List instances from your own life for each Samvaay.", "", ""],
    ["2025-11-16", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-11-16", "SOL · all",           "SOL Week",                               "", "", ""],

    ["2025-12-07", "Jainism · Charitra",  "",                                        "", "", ""],
    ["2025-12-07", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-12-07", "Yoga · all",          "",                                        "", "", ""],

    ["2025-12-14", "Jainism · Charitra",  "",                                        "", "", ""],
    ["2025-12-14", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2025-12-14", "SOL · all",           "",                                        "", "", ""],

    ["2026-01-04", "Jainism · Charitra",  "",                                        "", "", ""],
    ["2026-01-04", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2026-01-04", "Yoga · all",          "",                                        "", "", ""],

    ["2026-02-01", "Jainism · Charitra",  "",                                        "", "", ""],
    ["2026-02-01", "Hindi · Advanced",    "",                                        "", "", ""],
    ["2026-02-01", "SOL · all",           "",                                        "", "", ""],

    ["2026-02-15", "Jainism · Darshan",   "Midterm review",                          "Choose 5 items from Upbhoparibhog Anuvrata that you personally use.", "", ""],
    ["2026-02-15", "Jainism · Charitra",  "Naam Karma",                              "Read the chapter. Study Acharya Mahashramanji's life.", "", ""],
    ["2026-02-15", "Hindi · Advanced",    "Vachan — Singular to Plural Rules",       "Practise the singular-to-plural rules on pages 168–169.", "", ""],
    ["2026-02-15", "Yoga · all",          "Yoga Week",                               "", "", ""],

    ["2026-03-01", "Jainism · Charitra",  "Acharya Tulsi and Agam Vakya",            "Choose an agam quote that resonates with you.", "", ""],
    ["2026-03-01", "Hindi · Advanced",    "Karak and Sarvanaam",                     "Complete the Karak and Sarvanaam exercises from class.", "", ""],
    ["2026-03-01", "SOL · all",           "SOL Week",                                "", "", ""],

    ["2026-03-15", "Jainism · Darshan",   "Samvar and Types of Bhay",                "Reflect on the things that make you fearful.", "", ""],
    ["2026-03-15", "Jainism · Charitra",  "Gotra Karma",                             "Read the chapter on Gotra Karma.", "", ""],
    ["2026-03-15", "Hindi · Advanced",    "",                                         "", "", ""],
    ["2026-03-15", "Yoga · all",          "Yoga Week",                               "", "", ""],

    ["2026-03-29", "Jainism · Darshan",   "Completed chapter — Bhay",                "Read chapter 10 as pre-reading for next class.", "", ""],
    ["2026-03-29", "Jainism · Charitra",  "Antaraya Karma",                          "Evaluate your actions over the past 3 days.", "", ""],
    ["2026-03-29", "Hindi · Advanced",    "Karak, Kaal (Tenses), and Sarvanaam",     "Complete the Kaal (tenses) exercises from class.", "", ""],
    ["2026-03-29", "SOL · all",           "SOL Week",                                "", "", ""],

    ["2026-04-12", "Jainism · Charitra",  "Nine Tattvas — pages 222 onwards",        "Read pages 222–226.", "", ""],
    ["2026-04-12", "Hindi · Advanced",    "Writing a letter to the Gyanshala coordinator", "Complete the letter begun in class.", "", ""],
    ["2026-04-12", "Yoga · all",          "Yoga Week",                               "", "", ""],

    ["2026-04-26", "Jainism · Darshan",   "6 Aavashyak rituals and Pratikraman",     "Write about what is Pratikraman and describe our key rituals.", "", ""],
    ["2026-04-26", "Jainism · Charitra",  "Pages 227–231",                           "Prepare questions on the assigned topics.", "", ""],
    ["2026-04-26", "Hindi · Advanced",    "",                                         "", "", ""],
    ["2026-04-26", "SOL · all",           "SOL Week",                                "", "", ""],

    ["2026-05-03", "Jainism · Darshan",   "Anekantavada — Many-Sided Truth",         "Write three short examples of how anekantavada applies to an everyday disagreement.", "May 17, 2026", ""],
    ["2026-05-03", "Jainism · Charitra",  "The Five Mahavratas",                     "List the five Mahavratas and write one sentence each.", "May 17, 2026", ""],
    ["2026-05-03", "Hindi · Advanced",    "Writing a letter to the Gyanshala coordinator", "गृहकार्य के रूप में आपको वही पत्र पूरा करना है।\n\nअपने पत्र की शुरुआत सही संबोधन से करें – आदरणीय संचालिका जी\n\nपत्र में इन बातों का उल्लेख करे (state the following in your letter):\n\nआपको ज्ञानशाला में क्या सबसे अच्छा लगता है।\n\nआपने वहाँ क्या नया सीखा।\n\nआप ज्ञानशाला को और बेहतर बनाने के लिए क्या सुझाव (suggestion) देना चाहते हैं।\n\nसरल और शुद्ध हिंदी में 5–8 वाक्य लिखें – write 5–8 sentences in simple Hindi.", "May 17, 2026", ""],
    ["2026-05-03", "SOL · Darshan",       "Syadvada and Open Thinking",              "", "", ""],
    ["2026-05-03", "SOL · Charitra",      "Right Conduct — Samyak Charitra",         "", "", ""],
    ["2026-05-03", "Yoga · all",          "Pranayama Breathing and Focus",           "", "", ""]
  ];

  /* ── Parse a raw rows array into structured objects ───────────── */
  function parseRows(rows) {
    return rows.map(function (row) {
      var weekDate = (row[0] || '').trim();
      var dueDate  = (row[4] || '').trim();
      /* If no explicit due date, derive it from the next class in the schedule */
      if (!dueDate && weekDate) dueDate = nextClassLabel(weekDate);
      return {
        weekDate:    weekDate,
        subject:     (row[1] || '').trim(),   /* "Jainism · Sanskaar" */
        topic:       (row[2] || '').trim(),
        homework:    (row[3] || '').trim(),
        dueDate:     dueDate,
        parentNotes: (row[5] || '').trim()
      };
    });
  }

  /* ── Filter to the current week ───────────────────────────────── */
  function filterWeek(records, weekDate) {
    return records.filter(function (r) { return r.weekDate === weekDate; });
  }

  /* ── Hide footer/HW section on cards with no homework ────────── */
  /* Catches cards that had NO matching data row (applyToDOM never ran).
     Checks the hw text AND whether the section was already hidden.    */
  function hideEmptyFooters() {
    document.querySelectorAll('.class-card').forEach(function (card) {
      if (card.style.display === 'none') return;
      /* Skip if a notice is already present — applyToDOM already handled it */
      if (card.querySelector('.js-no-hw-notice')) return;
      var hw = card.querySelector('.js-homework');
      if (!hw) return;
      var hwSection = card.querySelector('.js-homework-section');
      /* No data row was applied AND the section is still visible with placeholder text */
      var sectionVisible = !hwSection || hwSection.style.display !== 'none';
      if (!hw.textContent.trim() || !sectionVisible) return; /* already empty — do nothing extra */
      /* No data row at all — section is visible but we have no data for this week.
         Hide it and add the notice.                                    */
      /* Actually: if section is visible but we still have no homework text we need to
         check: did applyToDOM run for this card? If hw has placeholder text from HTML
         and NO data row matched, we should still show the notice.      */
      /* Simplest reliable heuristic: if js-homework-section is still showing AND
         there is no matching inline record for this card's subject+track+week,
         we leave those cards alone (they have legit placeholder content).
         hideEmptyFooters only acts on cards where hwEl text was explicitly cleared. */
      if (!hw.textContent.trim()) {
        if (hwSection) hwSection.style.display = 'none';
        var footer = card.querySelector('.class-card-footer');
        if (footer) footer.style.display = 'none';
        var hwHeader = card.querySelector('.class-card-hw-header');
        if (hwHeader) hwHeader.style.display = 'none';
        var right = card.querySelector('.class-card-right');
        if (right && !right.querySelector('.js-no-hw-notice')) {
          var notice = document.createElement('p');
          notice.className = 'js-no-hw-notice class-card-no-hw';
          notice.textContent = 'No homework assigned this session.';
          right.appendChild(notice);
        }
      }
    });
  }

  /* ── Apply data to DOM cards ──────────────────────────────────── */
  function applyToDOM(records) {
    records.forEach(function (rec) {
      /* subject format: "Jainism · Sanskaar" → type="Jainism" track="Sanskaar" */
      var parts   = rec.subject.split('·');
      var type    = (parts[0] || '').trim();   /* Jainism / Hindi / SOL / Yoga */
      var track   = (parts[1] || '').trim();   /* Sanskaar / Beginner / all … */

      /* Find matching card(s) — data-subject and data-track on <article> */
      var selector = '[data-subject="' + type + '"][data-track="' + track + '"]';
      var cards = document.querySelectorAll(selector);

      cards.forEach(function (card) {
        /* Topic / "What we learned" */
        var topicEl = card.querySelector('.js-topic');
        if (topicEl && rec.topic) {
          topicEl.textContent = rec.topic;
          var topicSection = card.querySelector('.js-sol-topic-section');
          if (topicSection) topicSection.style.display = '';
        }

        /* Homework */
        var hwEl = card.querySelector('.js-homework');
        if (hwEl) {
          if (rec.homework) {
            /* Render \n\n as paragraphs, \n as line breaks */
            var hwHtml = rec.homework
              .split('\n\n')
              .map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; })
              .join('');
            hwEl.innerHTML = hwHtml;

            /* Remove any previously-added no-hw notice */
            var oldNotice = card.querySelector('.js-no-hw-notice');
            if (oldNotice) oldNotice.remove();
          } else {
            hwEl.textContent = '';
            var hwSection = card.querySelector('.js-homework-section');
            if (hwSection) hwSection.style.display = 'none';
            var footer = card.querySelector('.class-card-footer');
            if (footer) footer.style.display = 'none';
            var hwHeader = card.querySelector('.class-card-hw-header');
            if (hwHeader) hwHeader.style.display = 'none';
            /* Add "no homework" notice if not already there */
            var right = card.querySelector('.class-card-right');
            if (right && !right.querySelector('.js-no-hw-notice')) {
              var notice = document.createElement('p');
              notice.className = 'js-no-hw-notice class-card-no-hw';
              notice.textContent = 'No homework assigned this session.';
              right.appendChild(notice);
            }
          }
        }

        /* Due date label — always write if we have a date and homework;
           clear it when there is no homework for this week.          */
        var dueEl = card.querySelector('.js-due-date');
        if (dueEl) {
          if (rec.homework && rec.dueDate) {
            dueEl.textContent = 'Due ' + rec.dueDate;
          } else if (!rec.homework) {
            dueEl.textContent = '';
          }
        }

        /* Parent notes (shown if non-empty) */
        var notesEl = card.querySelector('.js-parent-notes');
        if (notesEl) {
          if (rec.parentNotes) {
            notesEl.textContent = rec.parentNotes;
            notesEl.style.display = '';
          } else {
            notesEl.style.display = 'none';
          }
        }
      });
    });
  }

  /* ── Fetch from Google Sheets ─────────────────────────────────── */
  function fetchSheet(weekDate) {
    var url = 'https://sheets.googleapis.com/v4/spreadsheets/'
      + CONFIG.sheetId + '/values/' + CONFIG.range
      + '?key=' + CONFIG.apiKey;

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Sheet fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var records = parseRows(data.values || []);
        return filterWeek(records, weekDate);
      });
  }

  /* ── Fetch from local content.json fallback ───────────────────── */
  function fetchFallback(weekDate) {
    return fetch(FALLBACK_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var records = parseRows(data.values || []);
        return filterWeek(records, weekDate);
      });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function init() {
    var weekDate = document.body.getAttribute('data-week');
    if (!weekDate) return;

    /* Set the next-class due date on every card as a baseline.
       Cards with no matching content row (e.g. Darshan on a Yoga week)
       would otherwise keep the stale hardcoded date from the HTML.   */
    var defaultDue = nextClassLabel(weekDate);
    if (defaultDue) {
      document.querySelectorAll('.js-due-date').forEach(function (el) {
        el.textContent = 'Due ' + defaultDue;
      });
    }

    /* Apply inline data immediately — works on file:// too */
    var inlineRecords = filterWeek(parseRows(INLINE_DATA), weekDate);
    if (inlineRecords.length) {
      applyToDOM(inlineRecords);
      document.dispatchEvent(new CustomEvent('gyanshala:content-ready', { detail: inlineRecords }));
    }
    hideEmptyFooters();

    var useSheet = CONFIG.sheetId && CONFIG.apiKey;
    var promise  = useSheet ? fetchSheet(weekDate) : Promise.resolve(null);

    promise
      .then(function (records) {
        if (!records || records.length === 0) {
          /* No Sheet config or empty result → use fallback */
          return fetchFallback(weekDate);
        }
        return records;
      })
      .catch(function () {
        /* Sheet fetch errored → use fallback silently */
        return fetchFallback(weekDate);
      })
      .then(function (records) {
        if (records && records.length) {
          applyToDOM(records);
          document.dispatchEvent(
            new CustomEvent('gyanshala:content-ready', { detail: records })
          );
        }
        hideEmptyFooters();
      })
      .catch(function (err) {
        console.warn('Gyanshala: could not load content.', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

(function () {
  'use strict';

  /* ── Inline fallback data (mirrors content.json) ─────────────── */
  var INLINE_DATA = [
    ["2025-09-07", "Jainism · Charitra",  "Year 2 — Chapter 1",                "Read Chapter 1 and be ready to discuss in class.", "", ""],
    ["2025-09-07", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-09-07", "Yoga · all",          "Yoga Week",                          "", "", ""],

    ["2025-09-14", "Jainism · Darshan",   "Gati, Leshya, and Parshavnath's Story", "Explain what is Leshya and name all the types. Read chapter 16 about Prabhu Parshavnath's life for group discussion.", "", ""],
    ["2025-09-14", "Jainism · Charitra",  "Chapter 2",                          "Research arguments for or against the idea that Jain religion is part of Hinduism. Give three points why one should follow religious activity.", "", ""],
    ["2025-09-14", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-09-14", "SOL · all",           "SOL Week",                           "", "", ""],

    ["2025-09-28", "Jainism · Darshan",   "Introduction to Shravak and 5 Anuvratas", "Learn the names of leshya and the five Anuvratas.", "", ""],
    ["2025-09-28", "Jainism · Charitra",  "Punya and Paap",                     "Keep a daily log recording at least one Shubh Bhav, one Ashubh Bhav, and one Shuddh Bhav.", "", ""],
    ["2025-09-28", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-09-28", "Yoga · all",          "Yoga Week",                          "", "", ""],

    ["2025-10-12", "Hindi · Advanced",    "Kriya ke Prakar — Kinds of Verb (page 180)", "Complete Exercise 10 on page 181.", "", ""],
    ["2025-10-12", "SOL · all",           "SOL Week",                           "", "", ""],

    ["2025-11-02", "Jainism · Charitra",  "Samayik",                            "Do one Samayik before next class.", "", ""],
    ["2025-11-02", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-11-02", "Yoga · all",          "Yoga Week",                          "", "", ""],

    ["2025-11-16", "Jainism · Charitra",  "Samvaay",                            "Read the chapter. List instances from your own life for each Samvaay.", "", ""],
    ["2025-11-16", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-11-16", "SOL · all",           "SOL Week",                           "", "", ""],

    ["2025-12-07", "Jainism · Charitra",  "",                                   "", "", ""],
    ["2025-12-07", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-12-07", "Yoga · all",          "",                                   "", "", ""],

    ["2025-12-14", "Jainism · Charitra",  "",                                   "", "", ""],
    ["2025-12-14", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2025-12-14", "SOL · all",           "",                                   "", "", ""],

    ["2026-01-04", "Jainism · Charitra",  "",                                   "", "", ""],
    ["2026-01-04", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2026-01-04", "Yoga · all",          "",                                   "", "", ""],

    ["2026-02-01", "Jainism · Charitra",  "",                                   "", "", ""],
    ["2026-02-01", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2026-02-01", "SOL · all",           "",                                   "", "", ""],

    ["2026-02-15", "Jainism · Darshan",   "Midterm review",                     "Choose 5 items from Upbhoparibhog Anuvrata that you personally use.", "", ""],
    ["2026-02-15", "Jainism · Charitra",  "Naam Karma",                         "Read the chapter. Study Acharya Mahashramanji's life.", "", ""],
    ["2026-02-15", "Hindi · Advanced",    "Vachan — Singular to Plural Rules",  "Practise the singular-to-plural rules on pages 168–169.", "", ""],
    ["2026-02-15", "Yoga · all",          "Yoga Week",                          "", "", ""],

    ["2026-03-01", "Jainism · Charitra",  "Acharya Tulsi and Agam Vakya",       "Choose an agam quote that resonates with you.", "", ""],
    ["2026-03-01", "Hindi · Advanced",    "Karak and Sarvanaam",                "Complete the Karak and Sarvanaam exercises from class.", "", ""],
    ["2026-03-01", "SOL · all",           "SOL Week",                           "", "", ""],

    ["2026-03-15", "Jainism · Darshan",   "Samvar and Types of Bhay",           "Reflect on the things that make you fearful.", "", ""],
    ["2026-03-15", "Jainism · Charitra",  "Gotra Karma",                        "Read the chapter on Gotra Karma.", "", ""],
    ["2026-03-15", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2026-03-15", "Yoga · all",          "Yoga Week",                          "", "", ""],

    ["2026-03-29", "Jainism · Darshan",   "Completed chapter — Bhay",           "Read chapter 10 as pre-reading for next class.", "", ""],
    ["2026-03-29", "Jainism · Charitra",  "Antaraya Karma",                     "Evaluate your actions over the past 3 days.", "", ""],
    ["2026-03-29", "Hindi · Advanced",    "Karak, Kaal (Tenses), and Sarvanaam","Complete the Kaal (tenses) exercises from class.", "", ""],
    ["2026-03-29", "SOL · all",           "SOL Week",                           "", "", ""],

    ["2026-04-12", "Jainism · Charitra",  "Nine Tattvas — pages 222 onwards",   "Read pages 222–226.", "", ""],
    ["2026-04-12", "Hindi · Advanced",    "Writing a letter to the Gyanshala coordinator", "Complete the letter begun in class.", "", ""],
    ["2026-04-12", "Yoga · all",          "Yoga Week",                          "", "", ""],

    ["2026-04-26", "Jainism · Darshan",   "6 Aavashyak rituals and Pratikraman", "Write about what is Pratikraman and describe our key rituals.", "", ""],
    ["2026-04-26", "Jainism · Charitra",  "Pages 227–231",                      "Prepare questions on the assigned topics.", "May 2, 2026", ""],
    ["2026-04-26", "Hindi · Advanced",    "",                                   "", "", ""],
    ["2026-04-26", "SOL · all",           "SOL Week",                           "", "", ""],

    ["2026-05-03", "Jainism · Darshan",   "Anekantavada — Many-Sided Truth",    "Write three short examples of how anekantavada applies to an everyday disagreement.", "May 17, 2026", ""],
    ["2026-05-03", "Jainism · Charitra",  "The Five Mahavratas",                "List the five Mahavratas and write one sentence each.", "May 17, 2026", ""],
    ["2026-05-03", "Hindi · Advanced",    "Essay writing — Paragraph structure", "Write a short paragraph (6–8 sentences) in Hindi.", "May 17, 2026", ""],
    ["2026-05-03", "SOL · Darshan",       "Syadvada and Open Thinking",         "", "", ""],
    ["2026-05-03", "SOL · Charitra",      "Right Conduct — Samyak Charitra",    "", "", ""],
    ["2026-05-03", "Yoga · all",          "Pranayama Breathing and Focus",      "", "", ""]
  ];

  /* ── Exam dates (hardcoded — not in content.json) ────────────── */
  var EXAMS = {
    '2026-01-18': { label: 'Midterm Exam', type: 'midterm' },
    '2026-05-17': { label: 'Final Exam',   type: 'final'   },
    '2026-05-31': { label: 'Gyanotsav',    type: 'gyanotsav' }
  };

  /* ── Month names ──────────────────────────────────────────────── */
  var MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  /* Format YYYY-MM-DD → "Sunday, September 7, 2025" */
  function formatDate(iso) {
    var parts = iso.split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  /* Format YYYY-MM-DD → "September 2025" */
  function monthLabel(iso) {
    var parts = iso.split('-');
    return MONTHS[+parts[1] - 1] + ' ' + parts[0];
  }

  /* Determine tag types from a list of subjects for one week.
     Yoga is present every session so always include it.       */
  function tagsFor(subjects) {
    var tags = { yoga: true }; /* yoga every session */
    subjects.forEach(function (s) {
      var type = s.split('·')[0].trim().toLowerCase();
      if (type !== 'yoga') tags[type] = true; /* avoid duplicate */
    });
    /* Return in a consistent display order */
    var ORDER = ['jainism', 'sol', 'hindi', 'yoga'];
    return ORDER.filter(function (t) { return tags[t]; });
  }

  /* Build tag HTML */
  var TAG_LABELS = { jainism: 'Jainism', hindi: 'Hindi', sol: 'SOL', yoga: 'Yoga' };
  function tagHTML(type) {
    var label = TAG_LABELS[type] || (type.charAt(0).toUpperCase() + type.slice(1));
    return '<span class="sched-tag sched-tag--' + type + '">' + label + '</span>';
  }

  /* Is this date in the past (before today)? */
  function isPast(iso) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var parts = iso.split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d < today;
  }

  /* Is this the most recent session on or before today? */
  function isCurrent(iso, allDates) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var parts = iso.split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    if (d > today) return false;
    var latest = allDates
      .map(function (x) {
        var p = x.split('-');
        return new Date(+p[0], +p[1] - 1, +p[2]);
      })
      .filter(function (x) { return x <= today; })
      .sort(function (a, b) { return b - a; })[0];
    return latest && d.getTime() === latest.getTime();
  }

  /* Render the schedule into #schedule-root */
  function render(rows) {
    var root = document.getElementById('schedule-root');
    if (!root) return;

    /* Group by weekDate */
    var byDate = {};
    var dateOrder = [];
    rows.forEach(function (row) {
      var date    = (row[0] || '').trim();
      var subject = (row[1] || '').trim();
      if (!date || !subject) return;
      if (!byDate[date]) {
        byDate[date] = [];
        dateOrder.push(date);
      }
      byDate[date].push(subject);
    });

    /* Deduplicate, merge exam dates, sort */
    dateOrder = dateOrder.filter(function (d, i) { return dateOrder.indexOf(d) === i; });
    Object.keys(EXAMS).forEach(function (examDate) {
      if (dateOrder.indexOf(examDate) === -1) dateOrder.push(examDate);
    });
    dateOrder.sort();

    var allDates = dateOrder.filter(function (d) { return !EXAMS[d]; }); /* only class dates for "current" detection */

    /* Group by month */
    var byMonth = {};
    var monthOrder = [];
    dateOrder.forEach(function (iso) {
      var ml = monthLabel(iso);
      if (!byMonth[ml]) { byMonth[ml] = []; monthOrder.push(ml); }
      byMonth[ml].push(iso);
    });

    /* Build HTML */
    var html = '';
    monthOrder.forEach(function (month) {
      var monthId = 'month-' + month.replace(/\s/g, '-');
      html += '<section class="sched-month" aria-labelledby="' + monthId + '">';
      html += '<h2 class="sched-month-heading" id="' + monthId + '">' + month + '</h2>';
      html += '<ul class="sched-list" role="list">';

      byMonth[month].forEach(function (iso) {
        /* ── Exam row ── */
        if (EXAMS[iso]) {
          var exam = EXAMS[iso];
          var examPast = isPast(iso);
          var examCls = 'sched-row sched-row--exam';
          if (examPast) examCls += ' sched-row--past';
          html += '<li class="' + examCls + '">';
          html += '<a href="exams.html" class="sched-date">' + formatDate(iso) + '</a>';
          html += '<span class="sched-tag sched-tag--exam">' + exam.label + '</span>';
          html += '</li>';
          return;
        }

        /* ── Regular class row ── */
        var subjects = byDate[iso];
        var tags     = tagsFor(subjects);
        var past     = isPast(iso);
        var current  = isCurrent(iso, allDates);

        var cls = 'sched-row';
        if (current) cls += ' sched-row--current';
        else if (past) cls += ' sched-row--past';

        html += '<li class="' + cls + '">';
        if (current) {
          html += '<span class="sched-this-week-badge">This Week</span>';
        }
        html += '<a href="this-week.html?week=' + iso + '" class="sched-date">' + formatDate(iso) + '</a>';
        html += '<span class="sched-tags" aria-label="Subjects">';
        tags.forEach(function (t) { html += tagHTML(t); });
        html += '</span>';
        html += '</li>';
      });

      html += '</ul></section>';
    });

    root.innerHTML = html || '<p>No schedule data available.</p>';
  }

  /* ── Boot: try fetching fresh content.json, fall back to inline ── */
  function init() {
    var root = document.getElementById('schedule-root');

    /* Render immediately from inline data so it never shows blank */
    render(INLINE_DATA);

    /* Then try to fetch content.json for any live updates */
    if (typeof fetch === 'function') {
      fetch('content.json')
        .then(function (res) {
          if (!res.ok) throw new Error('fetch failed');
          return res.json();
        })
        .then(function (data) {
          if (data && data.values && data.values.length) {
            render(data.values);
          }
        })
        .catch(function () { /* silently keep inline render */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

(function () {
  'use strict';

  /* ── Class schedule (mirrors sol-yoga.js) ────────────────────────
     Due date for each class = the NEXT date in this list.
     Keep in sync with sol-yoga.js whenever the schedule changes.  */
  var SCHEDULE = [
    '2025-09-07', '2025-09-14', '2025-09-28', '2025-10-12',
    '2025-11-02', '2025-11-16', '2025-12-07', '2025-12-14',
    '2026-01-04', '2026-01-18', '2026-02-01', '2026-02-15',
    '2026-03-01', '2026-03-15', '2026-03-29', '2026-04-12',
    '2026-04-26', '2026-05-03', '2026-05-17'
  ];

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  /* "2026-05-03" → "May 3, 2026" */
  function fmtYMD(ymd) {
    var p = ymd.split('-');
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }

  /* Return the next class date (formatted) for a given YYYY-MM-DD class date.
     Returns null if the date isn't in the schedule or is the last entry.     */
  function nextClassLabel(classYMD) {
    var idx = SCHEDULE.indexOf(classYMD);
    if (idx < 0 || idx >= SCHEDULE.length - 1) return null;
    return fmtYMD(SCHEDULE[idx + 1]);
  }

  /* Parse a date string into a midnight-local Date object */
  function parseDate(str) {
    if (!str) return null;
    var d = new Date(str);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /* Parse YYYY-MM-DD without timezone shift */
  function parseYMD(ymd) {
    var p = ymd.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /* ── Homework rows — one entry per subject per class week ────────
     dueDate is derived automatically: it's the NEXT class in SCHEDULE.
     To add a new week: append rows for each subject taught that day. */
  var HOMEWORK_ROWS = [
    // ── Apr 12, 2026 (due Apr 26) ────────────────────────────────
    { subject: 'Jainism · Sanskaar',   classDate: '2026-04-12' },
    { subject: 'Jainism · Gyan',       classDate: '2026-04-12' },
    { subject: 'Jainism · Darshan',    classDate: '2026-04-12' },
    { subject: 'Jainism · Charitra',   classDate: '2026-04-12' },
    { subject: 'Hindi · Beginner',     classDate: '2026-04-12' },
    { subject: 'Hindi · Intermediate', classDate: '2026-04-12' },
    { subject: 'Hindi · Advanced',     classDate: '2026-04-12' },

    // ── Apr 26, 2026 (due May 3) ─────────────────────────────────
    { subject: 'Jainism · Sanskaar',   classDate: '2026-04-26' },
    { subject: 'Jainism · Gyan',       classDate: '2026-04-26' },
    { subject: 'Jainism · Darshan',    classDate: '2026-04-26' },
    { subject: 'Jainism · Charitra',   classDate: '2026-04-26' },
    { subject: 'Hindi · Beginner',     classDate: '2026-04-26' },
    { subject: 'Hindi · Intermediate', classDate: '2026-04-26' },
    { subject: 'Hindi · Advanced',     classDate: '2026-04-26' },

    // ── May 3, 2026 (due May 17) ─────────────────────────────────
    { subject: 'Jainism · Sanskaar',   classDate: '2026-05-03' },
    { subject: 'Jainism · Gyan',       classDate: '2026-05-03' },
    { subject: 'Jainism · Darshan',    classDate: '2026-05-03' },
    { subject: 'Jainism · Charitra',   classDate: '2026-05-03' },
    { subject: 'Hindi · Beginner',     classDate: '2026-05-03' },
    { subject: 'Hindi · Intermediate', classDate: '2026-05-03' },
    { subject: 'Hindi · Advanced',     classDate: '2026-05-03' }
  ];

  /* ── Match a subject to a child name ──────────────────────────── */
  function childNameFor() {
    return null;
  }

  /* ── Check if homework was already submitted (reads localStorage) ─
     submission.js stores keys as "child-{n}_{type}_{YYYY-MM-DD}".
     Profile order matches child-1 / child-2 DOM order.            */
  function isSubmitted() {
    return false;
  }

  /* ── Upcoming events shown alongside overdue chips ────────────── */
  var UPCOMING = [
    { text: 'Final Exam — Sunday, May 17, 2026', href: 'exams.html' }
  ];

  /* ── Home page: chips inside the This Week summary card ────────── */
  function showHomeBanner(overdueItems) {
    var myItems = overdueItems.filter(function (item) {
      return childNameFor(item.subject) !== null;
    });

    /* Deduplicate by subject — keep most recent class date per subject */
    var seen = {};
    myItems.forEach(function (item) {
      seen[item.subject] = item;
    });
    var uniqueItems = Object.keys(seen).map(function (k) { return seen[k]; });

    /* Filter out subjects already submitted in localStorage */
    uniqueItems = uniqueItems.filter(function (item) {
      return !isSubmitted(item.subject, item.classDate);
    });

    var chipsEl = document.getElementById('summary-chips');
    if (!chipsEl) return;
    if (!uniqueItems.length && !UPCOMING.length) return;

    chipsEl.innerHTML = '';

    if (uniqueItems.length) {
      var chip = document.createElement('a');
      chip.href = 'this-week.html#homework';
      chip.className = 'summary-chip summary-chip--overdue';
      chip.textContent = '⚠️ ' + uniqueItems.length + ' homework overdue';
      chipsEl.appendChild(chip);
    }

    UPCOMING.forEach(function (u) {
      var chip = document.createElement('a');
      chip.href = u.href;
      chip.className = 'summary-chip summary-chip--upcoming';
      chip.textContent = '📅 ' + u.text;
      chipsEl.appendChild(chip);
    });
  }

  /* ── This Week page: mark individual cards as overdue ─────────── */
  function markCardOverdue(card) {
    /* Replace "Not submitted" badge with "OVERDUE" */
    var badge = card.querySelector('.badge-not-submitted');
    if (badge) {
      badge.textContent = 'Overdue';
      badge.classList.remove('badge-not-submitted');
      badge.classList.add('badge-overdue');
    }

    /* Colour the due-date label red */
    var dueEl = card.querySelector('.js-due-date');
    if (dueEl) dueEl.classList.add('due-date--overdue');

    /* Add a red left border to the card */
    card.classList.add('class-card--overdue');
  }

  /* ── Core logic: check homework rows and apply UI ─────────────── */
  function processRows(rows) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var isHomePage     = !document.body.getAttribute('data-week');
    var isThisWeekPage = !!document.body.getAttribute('data-week');
    var overdueItems   = [];

    rows.forEach(function (item) {
      var subject = (item.subject || '').trim();
      if (!subject) return;

      /* Compute due date from schedule if not explicitly provided */
      var dueStr = (item.dueDate || '').trim();
      if (!dueStr && item.classDate) {
        dueStr = nextClassLabel(item.classDate) || '';
      }

      var dueDate = parseDate(dueStr);

      /* Overdue only when today is strictly past the due date.
         The due date is always the next class after the class date,
         so homework assigned on May 3 (due May 17) is not overdue
         until May 18 or later.                                      */
      if (!dueDate || dueDate >= today) return;

      overdueItems.push({ subject: subject, dueDate: dueStr, classDate: item.classDate || '' });

      if (isThisWeekPage) {
        /* Only mark cards overdue if this row belongs to the current page's week.
           Apr 26 rows (due May 3) are overdue, but the May 3 page shows
           May 3 homework — don't bleed past-week status onto current cards. */
        var pageWeek = document.body.getAttribute('data-week') || '';
        if (item.classDate && item.classDate !== pageWeek) return;

        var parts = subject.split('·');
        var type  = (parts[0] || '').trim();
        var track = (parts[1] || '').trim();
        var sel   = '[data-subject="' + type + '"][data-track="' + track + '"]';
        document.querySelectorAll(sel).forEach(markCardOverdue);
      }
    });

    if (isHomePage && overdueItems.length > 0) {
      showHomeBanner(overdueItems);
    }
  }

  /* ── Past-week page: mark every unsubmitted card overdue ─────── */
  function markAllCardsOnPastWeek() {
    var weekAttr = document.body.getAttribute('data-week');
    if (!weekAttr) return;

    var today   = new Date(); today.setHours(0, 0, 0, 0);
    /* Due date for this week = next class in schedule.
       Only mark overdue once that due date has passed. */
    var dueLabel = nextClassLabel(weekAttr);
    if (!dueLabel) return;
    var dueDate  = parseDate(dueLabel);
    if (!dueDate || dueDate >= today) return;

    document.querySelectorAll('.class-card').forEach(function (card) {
      var hwEl = card.querySelector('.js-homework');
      if (!hwEl || !hwEl.textContent.trim()) return;

      /* Skip already-submitted cards */
      var submitBtn = card.querySelector('.btn-hw-submit');
      if (submitBtn && submitBtn.classList.contains('btn-submitted')) return;

      markCardOverdue(card);
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function init() {
    processRows(HOMEWORK_ROWS);
    markAllCardsOnPastWeek();

    /* Try fetching live content.json for extra/updated rows */
    if (typeof fetch === 'function') {
      fetch('content.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var rows = (data.values || [])
            .filter(function (r) { return r[4]; })
            .map(function (r) { return { subject: (r[1] || ''), dueDate: (r[4] || '') }; });
          if (rows.length) processRows(rows);
        })
        .catch(function () { /* keep inline render */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

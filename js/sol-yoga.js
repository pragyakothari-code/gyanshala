(function () {
  'use strict';

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  /* ── Actual 2025–26 class schedule ───────────────────────────── */
  var SCHEDULE = [
    { date: '2025-09-07', type: 'yoga' },
    { date: '2025-09-14', type: 'sol'  },
    { date: '2025-09-28', type: 'yoga' },
    { date: '2025-10-12', type: 'sol'  },
    { date: '2025-11-02', type: 'yoga' },
    { date: '2025-11-16', type: 'sol'  },
    { date: '2025-12-07', type: 'yoga' },
    { date: '2025-12-14', type: 'sol'  },
    { date: '2026-01-04', type: 'yoga' },
    { date: '2026-01-18', type: 'exam' },
    { date: '2026-02-01', type: 'sol'  },
    { date: '2026-02-15', type: 'yoga' },
    { date: '2026-03-01', type: 'sol'  },
    { date: '2026-03-15', type: 'yoga' },
    { date: '2026-03-29', type: 'sol'  },
    { date: '2026-04-12', type: 'yoga' },
    { date: '2026-04-26', type: 'sol'  },
    { date: '2026-05-03', type: 'yoga' },
    { date: '2026-05-17', type: 'exam' }
  ];

  function formatLabel(dateStr) {
    var p = dateStr.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function applyWeekType(isSOL) {
    /* Yoga happens every session — the only meaningful distinction
       is whether SOL is on the curriculum this week.              */
    document.querySelectorAll('.js-week-type').forEach(function (el) {
      el.textContent = isSOL ? 'SOL Week' : 'Jainism Week';
    });

    /* Per-card labels — child-nav.js calls this again after correcting
       data-week-type per track, so the final render is always track-accurate. */
  }

  function wireNavButtons(idx) {
    var prevEntry = idx > 0 ? SCHEDULE[idx - 1] : null;
    var nextEntry = idx < SCHEDULE.length - 1 ? SCHEDULE[idx + 1] : null;

    document.querySelectorAll('.week-nav-btn-prev').forEach(function (btn) {
      if (prevEntry) {
        btn.removeAttribute('title');
        btn.setAttribute('aria-label', 'Go to ' + formatLabel(prevEntry.date));
        btn.addEventListener('click', function () {
          window.location.href = 'this-week.html?week=' + prevEntry.date;
        });
      } else {
        btn.disabled = true;
        btn.setAttribute('aria-label', 'No earlier classes');
      }
    });

    document.querySelectorAll('.week-nav-btn-next').forEach(function (btn) {
      if (nextEntry) {
        btn.removeAttribute('title');
        btn.setAttribute('aria-label', 'Go to ' + formatLabel(nextEntry.date));
        btn.addEventListener('click', function () {
          window.location.href = 'this-week.html?week=' + nextEntry.date;
        });
      } else {
        btn.disabled = true;
        btn.setAttribute('aria-label', 'No later classes');
      }
    });
  }

  function updateDateLabels(dateStr) {
    var label = formatLabel(dateStr);
    document.querySelectorAll('.week-nav-date-label').forEach(function (el) {
      el.textContent = label;
    });
  }

  function showExamBanner() {
    /* Replace the children grid with the banner in-place */
    var grid = document.querySelector('.children-grid');
    if (grid) {
      var banner = document.createElement('div');
      banner.className = 'exam-banner';
      banner.innerHTML =
        '<h2 class="exam-banner-heading">Exam Day</h2>' +
        '<p class="exam-banner-body">No regular classes today — good luck to all our students!</p>';
      grid.parentNode.replaceChild(banner, grid);
    }

    /* Hide the selector card and bottom tab bar */
    var selector = document.querySelector('.selector-card');
    if (selector) selector.style.display = 'none';
    var tabBar = document.getElementById('child-tab-bar');
    if (tabBar) tabBar.style.display = 'none';

    /* Hide the SOL/Yoga badge entirely; update the inline subtitle label */
    document.querySelectorAll('.week-type-badge').forEach(function (el) {
      el.style.display = 'none';
    });
    document.querySelectorAll('.js-week-type').forEach(function (el) {
      if (!el.classList.contains('week-type-badge')) el.textContent = 'Exam Day';
    });

    /* Prevent child-nav.js from re-applying SOL/Yoga labels */
    window.gyanshalaApplyWeekType = function () {};
  }

  function init() {
    /* Allow ?week=YYYY-MM-DD to override the hardcoded data-week */
    var params = new URLSearchParams(window.location.search);
    var weekParam = params.get('week');
    if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
      document.body.setAttribute('data-week', weekParam);
    }

    var weekAttr = document.body.getAttribute('data-week');

    /* Home page: no data-week on body — update summary card and exit */
    if (!weekAttr) {
      var entry = findCurrentEntry();
      updateHomeCard(entry);
      return;
    }

    /* Find this date in the schedule */
    var idx = -1;
    for (var i = 0; i < SCHEDULE.length; i++) {
      if (SCHEDULE[i].date === weekAttr) { idx = i; break; }
    }

    var entry = idx >= 0 ? SCHEDULE[idx] : null;
    var type  = entry ? entry.type : 'sol'; /* default to SOL if date not in schedule */

    updateDateLabels(weekAttr);
    wireNavButtons(idx >= 0 ? idx : 0);

    if (type === 'exam') {
      showExamBanner();
      return;
    }

    var isSOL = type === 'sol';
    window.thisWeekIsSOL = isSOL;
    applyWeekType(isSOL);
  }

  /* ── Home page: find the most recent class entry ─────────────── */
  function findCurrentEntry() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var todayStr = toYMD(today);
    var current = SCHEDULE[0];
    for (var i = 0; i < SCHEDULE.length; i++) {
      if (SCHEDULE[i].date <= todayStr) current = SCHEDULE[i];
      else break;
    }
    return current;
  }

  function updateHomeCard(entry) {
    var d = parseYMD(entry.date);

    var dateEl = document.querySelector('.js-summary-date');
    if (dateEl) dateEl.innerHTML = DAYS[d.getDay()] + ', ' + formatLabel(entry.date)
      + ' <span class="summary-time">&nbsp;&middot;&nbsp; 🕙 10:00 AM &ndash; 1:30 PM</span>';

    var textEl = document.querySelector('.js-summary-text');
    if (textEl) {
      if (entry.type === 'exam') {
        textEl.innerHTML = 'This Sunday is <strong>Exam Day</strong> — no regular classes. Make sure your child is prepared and arrives on time.';
      } else if (entry.type === 'sol') {
        textEl.innerHTML = 'This week includes <strong>SOL</strong> alongside regular Jainism classes — plus the usual <strong>Yoga</strong> session and Hindi. Check the full schedule for your children\'s specific topics and homework.';
      } else {
        textEl.innerHTML = 'This session features regular <strong>Jainism</strong> classes and <strong>Hindi</strong>, with the usual <strong>Yoga</strong> session at 10:20 AM. No SOL this session.';
      }
    }
  }

  /* Export so child-nav.js can re-run after updating data-week-type per track */
  window.gyanshalaApplyWeekType = applyWeekType;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

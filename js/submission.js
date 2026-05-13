(function () {
  'use strict';

  var STORAGE_KEY = 'gyanshala_submissions';

  /* ── Storage ──────────────────────────────────────────────────── */
  function getAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  }
  function setSubmitted(key) {
    var all = getAll();
    all[key] = { state: 'submitted', ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  /* ── Derive a stable key from the button's position in the DOM ── */
  function deriveKey(btn) {
    var section = btn.closest('[id^="child-"]');
    var childId = section ? section.id : 'child-0';          // "child-1" / "child-2"

    var card = btn.closest('.class-card');
    var subject = 'unknown';
    if (card) {
      if (card.classList.contains('class-card--jainism')) subject = 'jainism';
      else if (card.classList.contains('class-card--hindi'))   subject = 'hindi';
    }

    var week = document.body.getAttribute('data-week') || 'unknown';
    return childId + '_' + subject + '_' + week;
  }

  /* ── Apply visual state to a button + its sibling badge ─────── */
  function applyState(btn, state, key) {
    btn.removeAttribute('href');
    btn.style.pointerEvents = 'none';
    btn.setAttribute('aria-disabled', 'true');

    var footer = btn.closest('.class-card-footer');

    /* Remove any existing resubmit link */
    if (footer) {
      var old = footer.querySelector('.btn-resubmit');
      if (old) old.remove();
    }

    if (state === 'submitted') {
      btn.textContent = 'Submitted ✓';
      btn.classList.remove('btn-accent');
      btn.classList.add('btn-submitted');

      /* Add "Resubmit?" link — not shown for marked-done */
      if (footer && key) {
        var resubmit = document.createElement('button');
        resubmit.type = 'button';
        resubmit.className = 'btn-resubmit';
        resubmit.textContent = 'Resubmit ?';
        resubmit.setAttribute('aria-label', 'Undo submission and resubmit');
        resubmit.addEventListener('click', function () {
          resetState(btn, key, footer);
        });
        footer.appendChild(resubmit);
      }
    } else if (state === 'marked-done') {
      btn.textContent = 'Marked done ✓';
      btn.classList.remove('btn-accent');
      btn.classList.add('btn-marked-done');
    }

    /* Hide the status badge — handles both .badge-not-submitted and
       .badge-overdue (overdue.js may have swapped the class already) */
    if (footer) {
      var badge = footer.querySelector('.badge-not-submitted, .badge-overdue');
      if (badge) badge.style.display = 'none';
    }

    /* Strip overdue card styling now that homework is submitted */
    var card = btn.closest('.class-card');
    if (card) {
      card.classList.remove('class-card--overdue');
      var dueEl = card.querySelector('.js-due-date');
      if (dueEl) dueEl.classList.remove('due-date--overdue');
    }
  }

  /* ── Reset back to default so user can resubmit ─────────────── */
  function resetState(btn, key, footer) {
    /* Clear from localStorage */
    var all = getAll();
    delete all[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    /* Restore button */
    btn.textContent = 'Submit Homework';
    btn.setAttribute('href', '#');
    btn.style.pointerEvents = '';
    btn.removeAttribute('aria-disabled');
    btn.classList.remove('btn-submitted');
    btn.classList.add('btn-accent');

    /* Restore badge (may now carry .badge-overdue class) */
    if (footer) {
      var badge = footer.querySelector('.badge-not-submitted, .badge-overdue');
      if (badge) badge.style.display = '';
      var resubmit = footer.querySelector('.btn-resubmit');
      if (resubmit) resubmit.remove();
    }

    /* Re-apply overdue styling if this week is already in the past */
    var weekAttr = document.body.getAttribute('data-week');
    if (weekAttr) {
      var wp = weekAttr.split('-');
      var weekDate = new Date(parseInt(wp[0], 10), parseInt(wp[1], 10) - 1, parseInt(wp[2], 10));
      var todayReset = new Date(); todayReset.setHours(0, 0, 0, 0);
      if (weekDate < todayReset) {
        var card2 = btn.closest('.class-card');
        if (card2) {
          card2.classList.add('class-card--overdue');
          var dueEl2 = card2.querySelector('.js-due-date');
          if (dueEl2) dueEl2.classList.add('due-date--overdue');
        }
      }
    }

    /* Re-wire the click handler */
    btn.addEventListener('click', function handler(e) {
      e.preventDefault();
      var formUrl = btn.getAttribute('data-form-url');
      if (formUrl && formUrl !== '#') window.open(formUrl, '_blank', 'noopener');
      setSubmitted(key);
      applyState(btn, 'submitted', key);
      btn.removeEventListener('click', handler);
    });
  }

  /* ── Initialise all submit buttons ───────────────────────────── */
  function init() {
    var all = getAll();

    document.querySelectorAll('.btn-hw-submit').forEach(function (btn) {
      var key = deriveKey(btn);

      /* "Marked done" is set manually via data-hw-state on the article */
      var card = btn.closest('.class-card');
      if (card && card.getAttribute('data-hw-state') === 'marked-done') {
        applyState(btn, 'marked-done');
        return;
      }

      /* Restore submitted state from localStorage */
      if (all[key] && all[key].state === 'submitted') {
        applyState(btn, 'submitted', key);
        return;
      }

      /* Wire up click: open form + record submission */
      btn.addEventListener('click', function handler(e) {
        e.preventDefault();
        var formUrl = btn.getAttribute('data-form-url');
        if (formUrl && formUrl !== '#') {
          window.open(formUrl, '_blank', 'noopener');
        }
        setSubmitted(key);
        applyState(btn, 'submitted', key);
        btn.removeEventListener('click', handler);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

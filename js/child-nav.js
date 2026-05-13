(function () {
  'use strict';

  /* ── Update child section headings ──────────────────────────── */
  function applyNames(children) {
    var sec1 = document.getElementById('child-1');
    var sec2 = document.getElementById('child-2');

    if (sec1 && children[0]) {
      var h2 = sec1.querySelector('.child-section-title');
      var sub = sec1.querySelector('.child-section-sub');
      var name1 = children[0].name || 'Child 1';
      if (h2) h2.textContent = name1;
      if (sub) {
        var parts = [];
        if (children[0].jain)  parts.push(children[0].jain);
        if (children[0].hindi && children[0].hindi !== 'none') parts.push('Hindi ' + children[0].hindi);
        sub.textContent = parts.join(' · ');
      }
      sec1.querySelectorAll('.class-card-child-badge').forEach(function (b) {
        b.textContent = name1;
        b.setAttribute('aria-label', name1);
      });
    }

    if (sec2 && children[1]) {
      var h2b = sec2.querySelector('.child-section-title');
      var subb = sec2.querySelector('.child-section-sub');
      var name2 = children[1].name || 'Child 2';
      if (h2b) h2b.textContent = name2;
      if (subb) {
        var partsb = [];
        if (children[1].jain)  partsb.push(children[1].jain);
        if (children[1].hindi && children[1].hindi !== 'none') partsb.push('Hindi ' + children[1].hindi);
        subb.textContent = partsb.join(' · ');
      }
      sec2.querySelectorAll('.class-card-child-badge').forEach(function (b) {
        b.textContent = name2;
        b.setAttribute('aria-label', name2);
      });
    }
  }

  /* ── Update card data-track attributes from profile ─────────── */
  function applyTracks(children) {
    children.forEach(function (child, i) {
      var sec = document.getElementById('child-' + (i + 1));
      if (!sec || !child) return;

      /* Jainism card */
      if (child.jain) {
        var jainCard = sec.querySelector('[data-subject="Jainism"]');
        if (jainCard) {
          jainCard.setAttribute('data-track', child.jain);
          var h3j = jainCard.querySelector('.class-card-subject');
          if (h3j) h3j.textContent = child.jain;
        }
      }

      /* Hindi card */
      var hindiCard = sec.querySelector('[data-subject="Hindi"]');
      if (hindiCard) {
        if (child.hindi && child.hindi !== 'none') {
          hindiCard.setAttribute('data-track', child.hindi);
          var h3h = hindiCard.querySelector('.class-card-subject');
          if (h3h) h3h.textContent = child.hindi + ' Hindi';
          hindiCard.style.display = '';
        } else {
          hindiCard.style.display = 'none';
        }
      }

      /* SOL/Yoga card — track mirrors Jainism track */
      if (child.jain) {
        var solCard = sec.querySelector('[data-subject="SOL"]');
        if (solCard) {
          solCard.setAttribute('data-track', child.jain);
          solCard.setAttribute('data-week-type', child.jain);
          /* Re-apply labels since the inline script already ran with old data-week-type */
          var isSOL = window.thisWeekIsSOL !== false;
          var subjectEl = solCard.querySelector('.card-subject-name');
          if (subjectEl) subjectEl.textContent = isSOL ? child.jain + ' SOL' : 'Yoga';
          var trackEl = solCard.querySelector('.js-track-label');
          if (trackEl) trackEl.textContent = isSOL ? 'SOL' : 'Yoga';
          var badgeEl = solCard.querySelector('.js-week-type-badge');
          if (badgeEl) badgeEl.textContent = isSOL ? 'SOL' : 'Yoga';
          var coveredEl = solCard.querySelector('.card-covered-label');
          if (coveredEl) coveredEl.textContent = isSOL ? 'What we covered in SOL' : 'What we covered in Yoga';
        }
      }
    });
  }

  /* ── Mobile tab bar ──────────────────────────────────────────── */
  function buildTabBar(children) {
    var existing = document.getElementById('child-tab-bar');
    if (existing) existing.remove();

    var bar = document.createElement('nav');
    bar.id = 'child-tab-bar';
    bar.setAttribute('aria-label', 'Switch between children');

    children.forEach(function (child, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'child-tab' + (i === 0 ? ' child-tab--active' : '');
      btn.setAttribute('data-child', i + 1);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.textContent = child.name || ('Child ' + (i + 1));
      btn.addEventListener('click', function () { switchTab(i + 1, children.length); });
      bar.appendChild(btn);
    });

    document.body.appendChild(bar);
  }

  function switchTab(childNum, total) {
    /* Update tab button states */
    document.querySelectorAll('.child-tab').forEach(function (btn) {
      var active = parseInt(btn.getAttribute('data-child'), 10) === childNum;
      btn.classList.toggle('child-tab--active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    /* Show / hide sections on mobile */
    for (var i = 1; i <= total; i++) {
      var sec = document.getElementById('child-' + i);
      if (sec) sec.setAttribute('data-tab-hidden', i !== childNum ? 'true' : 'false');
    }
  }

  /* ── Count homework cards and update section badge ────────────── */
  function updateHwCounts(children) {
    children.forEach(function (child, i) {
      var sec     = document.getElementById('child-' + (i + 1));
      var countEl = document.getElementById('child-' + (i + 1) + '-hw-count');
      if (!sec || !countEl) return;
      var count = 0;
      sec.querySelectorAll('.class-card').forEach(function (card) {
        if (card.style.display === 'none') return;
        var hw = card.querySelector('.js-homework');
        if (hw && hw.textContent.trim()) count++;
      });
      if (count > 0) {
        countEl.textContent = count + ' Homework' + (count !== 1 ? 's' : '');
      }
    });
  }

  /* ── Hide second-child section when single child ─────────────── */
  function hideSingleChild(children) {
    var sec2 = document.getElementById('child-2');
    if (!sec2) return;
    if (children.length < 2) {
      sec2.style.display = 'none';
    }
  }

  /* ── Remove legacy manual selector card ─────────────────────── */
  function removeSelectorCard() {
    var card = document.querySelector('.selector-card');
    if (card) card.remove();
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function init(profile) {
    if (!profile || !profile.children || !profile.children.length) return;

    var children = profile.children;

    removeSelectorCard();
    applyTracks(children);
    /* Re-run SOL/Yoga labels now that data-week-type reflects the correct tracks */
    if (window.gyanshalaApplyWeekType) {
      window.gyanshalaApplyWeekType(window.thisWeekIsSOL !== false);
    }
    applyNames(children);
    updateHwCounts(children);
    hideSingleChild(children);

    if (children.length > 1) {
      buildTabBar(children);
      /* Start with child-1 visible, child-2 hidden (mobile) */
      switchTab(1, children.length);
    }
  }

  /* ── Boot from localStorage ──────────────────────────────────── */
  function boot() {
    var profile = null;
    try { profile = JSON.parse(localStorage.getItem('gyanshala_profile')); } catch (_) {}
    if (profile && profile.children && profile.children.length) {
      init(profile);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Re-run HW counts after data.js has applied content */
  document.addEventListener('gyanshala:content-ready', function () {
    var profile = null;
    try { profile = JSON.parse(localStorage.getItem('gyanshala_profile')); } catch (_) {}
    var children = (profile && profile.children) || [];
    updateHwCounts(children);
  });

})();

(function () {
  'use strict';

  var PROFILE_KEY = 'gyanshala_profile';
  var SUBMITTED_KEY = 'gyanshala_hw_submitted';

  function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch (_) { return null; }
  }

  function getSubmitted() {
    try { return JSON.parse(localStorage.getItem(SUBMITTED_KEY)) || {}; } catch (_) { return {}; }
  }

  function markSubmitted(cardId) {
    var s = getSubmitted();
    s[cardId] = true;
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(s));
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Build a unique ID for each card ──────────────────────────── */
  function cardId(card) {
    var subject = card.getAttribute('data-subject') || '';
    var track   = card.getAttribute('data-track')   || '';
    var section = card.closest('[id]') ? card.closest('[id]').id : 'child-1';
    return (section + '-' + subject + '-' + track).replace(/\s+/g, '-').toLowerCase();
  }

  /* ── Restore submitted state on page load ─────────────────────── */
  function restoreSubmittedStates() {
    var submitted = getSubmitted();
    document.querySelectorAll('.class-card').forEach(function (card) {
      var id = cardId(card);
      if (submitted[id]) flipToSubmitted(card, true);
    });
  }

  /* ── Flip a card's button + badge to submitted ────────────────── */
  function flipToSubmitted(card, instant) {
    var btn   = card.querySelector('.btn-hw-submit');
    var badge = card.querySelector('.badge-not-submitted, .badge-submitted');

    if (btn) {
      btn.textContent = 'Submitted ✓';
      btn.classList.add('btn-submitted');
      btn.style.pointerEvents = 'none';
    }
    if (badge) {
      badge.textContent = 'Resubmit';
      badge.className = 'badge badge-submitted';
      badge.style.cursor = 'pointer';
      badge.style.opacity = '0.7';
    }
  }

  /* ── Modal overlay ────────────────────────────────────────────── */
  function openModal(html) {
    closeModal();
    var overlay = document.createElement('div');
    overlay.id = 'hw-overlay';
    overlay.style.cssText = [
      'position:fixed','inset:0','top:0','left:0','right:0','bottom:0',
      'background:rgba(15,23,60,0.52)',
      'display:flex','align-items:center','justify-content:center',
      'z-index:9999','padding:20px 16px','box-sizing:border-box'
    ].join(';');
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeModal(); });

    var card = document.createElement('div');
    card.style.cssText = [
      'position:relative','background:#fff','border-radius:18px',
      'box-shadow:0 8px 48px rgba(15,23,60,0.22)',
      'padding:40px 36px 36px',
      'width:420px','max-width:calc(100vw - 32px)',
      'max-height:calc(100vh - 40px)','overflow-y:auto',
      'box-sizing:border-box','text-align:left'
    ].join(';');
    card.innerHTML = html;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    return card;
  }

  function closeModal() {
    var el = document.getElementById('hw-overlay');
    if (el) el.remove();
    document.body.style.overflow = '';
  }

  /* ── Show the submission form ─────────────────────────────────── */
  function showSubmitModal(card) {
    var subject  = card.getAttribute('data-subject') || 'Class';
    var track    = (card.querySelector('.class-card-subject') || {}).textContent || subject;
    var hwText   = (card.querySelector('.js-homework') || {}).textContent || '';
    var dueText  = (card.querySelector('.js-due-date') || {}).textContent || '';

    var profile  = getProfile();
    var section  = card.closest('.child-section');
    var childName = '';
    if (section) {
      var nameEl = section.querySelector('.child-section-title');
      if (nameEl) childName = nameEl.textContent.trim();
    }
    if (!childName && profile && profile.children && profile.children[0]) {
      childName = profile.children[0].name;
    }

    var modalCard = openModal(
      /* Close */
      '<button id="hw-close" type="button" aria-label="Close" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#9ca3af;cursor:pointer;padding:4px 8px;border-radius:4px;">✕</button>' +

      /* Header */
      '<p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#2E52A3;margin:0 0 4px;">Submit Homework</p>' +
      '<h2 style="font-family:inherit;font-size:1.3rem;font-weight:700;color:#111827;margin:0 0 4px;">' + esc(track) + '</h2>' +
      (dueText ? '<p style="font-size:0.85rem;color:#6b7280;margin:0 0 20px;">' + esc(dueText) + '</p>' : '<div style="margin-bottom:20px;"></div>') +

      /* Assignment reminder */
      '<div style="background:#f8faff;border:1px solid rgba(46,82,163,0.15);border-radius:8px;padding:12px 14px;margin-bottom:20px;">' +
        '<p style="font-size:0.8rem;font-weight:600;color:#2E52A3;margin:0 0 4px;">Assignment</p>' +
        '<p style="font-size:0.875rem;color:#374151;margin:0;">' + esc(hwText) + '</p>' +
      '</div>' +

      /* Child name (pre-filled) */
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#111827;margin-bottom:6px;">Student name</label>' +
        '<input id="hw-name" type="text" value="' + esc(childName) + '" style="width:100%;font-family:inherit;font-size:0.9375rem;color:#111827;background:#fff;border:1.5px solid #d1d5db;border-radius:8px;padding:10px 12px;box-sizing:border-box;outline:none;">' +
      '</div>' +

      /* File upload */
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#111827;margin-bottom:6px;">Upload your work <span style="font-weight:400;color:#6b7280;">(photo or PDF)</span></label>' +
        '<label id="hw-drop" for="hw-file" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:2px dashed #d1d5db;border-radius:10px;padding:22px 16px;cursor:pointer;transition:border-color 0.15s;text-align:center;">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '<span id="hw-file-label" style="font-size:0.875rem;color:#6b7280;">Drag &amp; drop or <span style="color:#2E52A3;font-weight:600;">choose file</span></span>' +
        '</label>' +
        '<input id="hw-file" type="file" accept="image/*,.pdf" style="display:none;">' +
      '</div>' +

      /* Note */
      '<div style="margin-bottom:20px;">' +
        '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#111827;margin-bottom:6px;">Note to teacher <span style="font-weight:400;color:#6b7280;">(optional)</span></label>' +
        '<textarea id="hw-note" rows="2" placeholder="Any context for your teacher..." style="width:100%;font-family:inherit;font-size:0.9rem;color:#111827;background:#fff;border:1.5px solid #d1d5db;border-radius:8px;padding:10px 12px;box-sizing:border-box;outline:none;resize:vertical;"></textarea>' +
      '</div>' +

      /* Error */
      '<p id="hw-err" style="font-size:0.8125rem;color:#dc2626;margin:-10px 0 10px;display:none;">Please attach your work before submitting.</p>' +

      /* Submit */
      '<button id="hw-submit" type="button" style="display:block;width:100%;font-family:inherit;font-size:0.9375rem;font-weight:600;background:#2E52A3;color:#fff;border:none;border-radius:8px;padding:13px 16px;cursor:pointer;box-sizing:border-box;">Submit Homework</button>'
    );

    /* Close button */
    modalCard.querySelector('#hw-close').onclick = closeModal;

    /* File input → update label */
    var fileInput = modalCard.querySelector('#hw-file');
    var fileLabel = modalCard.querySelector('#hw-file-label');
    var dropZone  = modalCard.querySelector('#hw-drop');

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        fileLabel.textContent = '📎 ' + fileInput.files[0].name;
        dropZone.style.borderColor = '#2E52A3';
        dropZone.style.background  = '#f0f5ff';
      }
    });

    /* Drag over styling */
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.style.borderColor = '#2E52A3';
      dropZone.style.background  = '#f0f5ff';
    });
    dropZone.addEventListener('dragleave', function () {
      if (!fileInput.files || !fileInput.files[0]) {
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.background  = '';
      }
    });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        fileLabel.textContent = '📎 ' + e.dataTransfer.files[0].name;
        dropZone.style.borderColor = '#2E52A3';
        dropZone.style.background  = '#f0f5ff';
      }
    });

    /* Submit */
    modalCard.querySelector('#hw-submit').onclick = function () {
      var hasFile = fileInput.files && fileInput.files.length > 0;
      var errEl   = modalCard.querySelector('#hw-err');
      if (!hasFile) { errEl.style.display = 'block'; return; }
      errEl.style.display = 'none';
      showLoadingState(modalCard, card);
    };
  }

  /* ── Loading → Success ────────────────────────────────────────── */
  function showLoadingState(modalCard, sourceCard) {
    var submitBtn = modalCard.querySelector('#hw-submit');
    submitBtn.textContent = 'Submitting…';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    setTimeout(function () {
      showSuccessState(modalCard, sourceCard);
    }, 1400);
  }

  function showSuccessState(modalCard, sourceCard) {
    modalCard.innerHTML =
      '<div style="text-align:center;padding:12px 0 8px;">' +
        /* Checkmark circle */
        '<div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<h2 style="font-family:inherit;font-size:1.3rem;font-weight:700;color:#111827;margin:0 0 8px;">Homework submitted!</h2>' +
        '<p style="font-size:0.9rem;color:#6b7280;margin:0 0 28px;">Your teacher will review it before next Sunday.</p>' +
        '<button id="hw-done" type="button" style="display:block;width:100%;font-family:inherit;font-size:0.9375rem;font-weight:600;background:#FFD039;color:#1E3A80;border:none;border-radius:8px;padding:13px 16px;cursor:pointer;box-sizing:border-box;">Done</button>' +
      '</div>';

    /* Flip the card badge */
    markSubmitted(cardId(sourceCard));
    flipToSubmitted(sourceCard);

    modalCard.querySelector('#hw-done').onclick = closeModal;
  }

  /* ── Wire up all Submit Homework buttons ─────────────────────── */
  function init() {
    restoreSubmittedStates();

    document.addEventListener('click', function (e) {
      /* Submit button (when not already submitted) */
      var btn = e.target.closest('.btn-hw-submit');
      if (btn && !btn.classList.contains('btn-submitted')) {
        e.preventDefault();
        var card = btn.closest('.class-card');
        if (card) showSubmitModal(card);
        return;
      }
      /* Resubmit pill */
      var badge = e.target.closest('.badge-submitted');
      if (badge && badge.textContent.trim() === 'Resubmit') {
        e.preventDefault();
        var card2 = badge.closest('.class-card');
        if (card2) showSubmitModal(card2);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

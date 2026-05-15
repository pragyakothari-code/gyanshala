(function () {
  'use strict';

  var SESSION_KEY = 'gyanshala_session';
  var PROFILE_KEY = 'gyanshala_profile';
  var childCounter = 0;
  var _savedScrollY = 0;
  var _vpListener = null;

  /* ── Scroll lock / unlock (iOS-safe) ─────────────────────────── */
  function lockScroll() {
    _savedScrollY = window.pageYOffset || 0;
    document.body.style.top = '-' + _savedScrollY + 'px';
    document.body.classList.add('modal-open');
  }

  function unlockScroll() {
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, _savedScrollY);
    _savedScrollY = 0;
  }

  /* ── Storage ─────────────────────────────────────────────────── */
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (_) { return null; } }
  function getProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch (_) { return null; } }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ── Inject nav "Sign in" button ─────────────────────────────── */
  var PERSON_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';

  function injectNavButton() {
    if (document.getElementById('auth-nav-btn')) return;
    var btn = document.createElement('button');
    btn.id        = 'auth-nav-btn';
    btn.type      = 'button';
    btn.className = 'auth-nav-btn';
    btn.innerHTML = '<span class="auth-nav-text"></span><span class="auth-nav-icon"></span>';
    refreshNavBtn(btn);
    btn.addEventListener('click', function () { getSession() ? showAccountModal() : showAuthModal(); });
    var nav = document.querySelector('nav');
    if (nav) nav.appendChild(btn);
  }

  function refreshNavBtn(btn) {
    btn = btn || document.getElementById('auth-nav-btn');
    if (!btn) return;
    var s = getSession();
    var label = s ? (s.name ? s.name.split(' ')[0] : 'Account') : 'Sign in';
    var initial = label.charAt(0).toUpperCase();
    var textEl = btn.querySelector('.auth-nav-text');
    var iconEl = btn.querySelector('.auth-nav-icon');
    if (textEl) textEl.textContent = label;
    if (iconEl) iconEl.innerHTML = (s && window.innerWidth >= 768) ? initial : PERSON_ICON;
    btn.setAttribute('aria-label', s ? label + ' — account' : 'Sign in');
    /* Hide on mobile only when signed out — popup handles that case */
    if (s) btn.classList.remove('signed-out');
    else btn.classList.add('signed-out');
  }

  /* ── Modal shell ─────────────────────────────────────────────── */
  function openModal(innerHTML) {
    closeModal();

    /* Full-screen overlay */
    var overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'top:0','left:0','right:0','bottom:0',  /* fallback for older Safari */
      'background:rgba(15,23,60,0.55)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'z-index:9999',
      'padding:20px 16px',
      'box-sizing:border-box'
    ].join(';');

    /* Dismiss on backdrop click */
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeModal(); });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
      if (e.key !== 'Tab') return;
      var els = overlay.querySelectorAll('input,select,button,[tabindex]');
      var arr = Array.prototype.slice.call(els);
      if (!arr.length) return;
      if (e.shiftKey && document.activeElement === arr[0])               { e.preventDefault(); arr[arr.length-1].focus(); }
      else if (!e.shiftKey && document.activeElement === arr[arr.length-1]) { e.preventDefault(); arr[0].focus(); }
    });

    /* Card — fixed size, flex column so content centres vertically */
    var card = document.createElement('div');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.style.cssText = [
      'position:relative',
      'background:#fff',
      'border-radius:18px',
      'box-shadow:0 8px 48px rgba(15,23,60,0.22)',
      'padding:44px 40px 40px',
      'width:400px',
      'max-width:calc(100vw - 32px)',
      'height:520px',
      'max-height:calc(100vh - 40px)',
      'overflow-y:auto',
      'box-sizing:border-box',
      'display:flex',
      'flex-direction:column',
      'justify-content:center',
      'text-align:center'
    ].join(';');
    card.innerHTML = innerHTML;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    lockScroll();
    _attachVP();

    /* Style elements inside card */
    styleCard(card);

    setTimeout(function () { var f = card.querySelector('input,button'); if (f) f.focus(); }, 40);
    return card;
  }

  /* On iOS, when an input is focused the keyboard + autofill bar slides up and
     can cover buttons. We listen for focusin on any input inside the modal,
     wait for the keyboard to finish opening, then scroll the card so the
     primary action button sits above the autofill bar zone (~80 px from bottom). */
  function _onModalFocusIn(e) {
    var tag = e.target && e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') return;
    var overlay = document.getElementById('auth-overlay');
    if (!overlay || !overlay.contains(e.target)) return;

    setTimeout(function () {
      var card = overlay.querySelector('[role="dialog"]');
      if (!card) return;

      /* Shrink card to the visual viewport so it doesn't extend behind keyboard */
      var visH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      card.style.height         = 'auto';
      card.style.maxHeight      = (visH - 16) + 'px';
      card.style.overflowY      = 'auto';
      card.style.justifyContent = 'flex-start';

      /* Scroll card so the primary button is above the autofill-bar dead zone */
      var btn = card.querySelector('.am-btn-primary') || card.querySelector('.am-btn-accent');
      if (btn) {
        var SAFE = 80; /* px to keep clear of autofill bar */
        var cardRect = card.getBoundingClientRect();
        var btnRect  = btn.getBoundingClientRect();
        var btnBottomRelative = btnRect.bottom - cardRect.top + card.scrollTop;
        var targetScroll = btnBottomRelative - (card.clientHeight - SAFE);
        if (targetScroll > 0) card.scrollTop = targetScroll;
      }
    }, 380); /* wait for iOS keyboard animation */
  }

  function _attachVP() {
    if (_vpListener) return;
    _vpListener = _onModalFocusIn;
    document.addEventListener('focusin', _vpListener);
  }

  function _detachVP() {
    if (!_vpListener) return;
    document.removeEventListener('focusin', _vpListener);
    _vpListener = null;
  }

  function closeModal() {
    var el = document.getElementById('auth-overlay');
    if (el) el.remove();
    _detachVP();
    unlockScroll();
  }

  /* Apply inline styles to all dynamic card elements */
  function styleCard(card) {
    /* Heading */
    card.querySelectorAll('.am-heading').forEach(function (el) {
      el.style.cssText = 'font-family:inherit;font-size:1.45rem;font-weight:700;color:#2E52A3;margin:0 0 24px;line-height:1.25;';
    });
    /* Sub */
    card.querySelectorAll('.am-sub').forEach(function (el) {
      el.style.cssText = 'font-size:0.9rem;color:#6b7280;margin:-14px 0 20px;';
    });
    /* Close btn — absolute so it doesn't affect flex flow */
    card.querySelectorAll('.am-close').forEach(function (el) {
      el.style.cssText = 'position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.1rem;color:#9ca3af;cursor:pointer;padding:4px 6px;line-height:1;border-radius:4px;flex-shrink:0;';
    });
    /* Email chip */
    card.querySelectorAll('.am-chip').forEach(function (el) {
      el.style.cssText = 'display:inline-flex;align-items:center;gap:7px;font-size:0.875rem;color:#374151;background:#f3f4f6;border-radius:20px;padding:5px 14px;margin-bottom:20px;';
    });
    /* Fields */
    card.querySelectorAll('.am-field').forEach(function (el) {
      el.style.cssText = 'display:flex;flex-direction:column;margin-bottom:16px;';
    });
    card.querySelectorAll('.am-label').forEach(function (el) {
      el.style.cssText = 'font-size:0.8125rem;font-weight:600;color:#111827;margin-bottom:6px;text-align:left;';
    });
    card.querySelectorAll('.am-input,.am-select').forEach(function (el) {
      el.style.cssText = 'font-family:inherit;font-size:1rem;color:#111827;background:#fff;border:1.5px solid #d1d5db;border-radius:8px;padding:10px 12px;width:100%;box-sizing:border-box;appearance:none;-webkit-appearance:none;outline:none;';
      el.addEventListener('focus', function () { this.style.borderColor = '#2E52A3'; this.style.boxShadow = '0 0 0 3px rgba(30,43,94,0.10)'; });
      el.addEventListener('blur',  function () { this.style.borderColor = '#d1d5db'; this.style.boxShadow = 'none'; });
    });
    /* Password wrap */
    card.querySelectorAll('.am-pw-wrap').forEach(function (el) {
      el.style.cssText = 'position:relative;';
      var inp = el.querySelector('.am-input');
      if (inp) inp.style.paddingRight = '44px';
    });
    card.querySelectorAll('.am-eye').forEach(function (el) {
      el.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;display:flex;padding:4px;';
    });
    /* Two-col row */
    card.querySelectorAll('.am-row').forEach(function (el) {
      el.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;';
    });
    /* Primary button */
    card.querySelectorAll('.am-btn-primary').forEach(styleBtn.bind(null, '#2E52A3', '#fff'));
    /* Accent button */
    card.querySelectorAll('.am-btn-accent').forEach(styleBtn.bind(null, '#FFD039', '#1E3A80'));
    /* Ghost button */
    card.querySelectorAll('.am-btn-ghost').forEach(styleBtn.bind(null, '#f3f4f6', '#111827'));
    /* Danger button */
    card.querySelectorAll('.am-btn-danger').forEach(function (el) {
      styleBtn('#fef2f2', '#dc2626', el);
      el.style.marginTop = '8px';
    });
    /* Divider */
    card.querySelectorAll('.am-divider-or').forEach(function (el) {
      el.style.cssText = 'display:flex;align-items:center;gap:10px;margin:16px 0;color:#9ca3af;font-size:0.8125rem;';
      var spans = el.querySelectorAll('span');
      spans.forEach(function (s) { s.style.cssText = 'flex:1;height:1px;background:#e5e7eb;display:block;'; });
    });
    /* Back / link */
    card.querySelectorAll('.am-link').forEach(function (el) {
      el.style.cssText = 'display:block;background:none;border:none;font-family:inherit;font-size:0.875rem;color:#6b7280;cursor:pointer;padding:10px 0 0;text-align:center;';
      el.addEventListener('mouseover', function () { this.style.color = '#111827'; });
      el.addEventListener('mouseout',  function () { this.style.color = '#6b7280'; });
    });
    /* Add child link */
    card.querySelectorAll('.am-add-child').forEach(function (el) {
      el.style.cssText = 'background:none;border:none;font-family:inherit;font-size:0.875rem;font-weight:600;color:#2e52a3;cursor:pointer;padding:4px 0 14px;display:block;';
    });
    /* Child divider */
    card.querySelectorAll('.am-sep').forEach(function (el) {
      el.style.cssText = 'border:none;border-top:1px solid #e5e7eb;margin:8px 0 18px;';
    });
    /* Error */
    card.querySelectorAll('.am-err').forEach(function (el) {
      el.style.cssText = 'font-size:0.8125rem;color:#dc2626;margin:4px 0 0;';
    });
  }

  function styleBtn(bg, color, el) {
    el.style.cssText = [
      'display:block','width:100%','font-family:inherit',
      'font-size:0.9375rem','font-weight:600',
      'background:' + bg, 'color:' + color,
      'border:none','border-radius:8px',
      'padding:12px 16px','cursor:pointer',
      'margin-top:8px','box-sizing:border-box',
      'transition:opacity 0.15s'
    ].join(';');
    el.addEventListener('mouseover', function () { this.style.opacity = '0.88'; });
    el.addEventListener('mouseout',  function () { this.style.opacity = '1'; });
  }

  function closeBtn() {
    return '<button class="am-close" id="auth-close" type="button" aria-label="Close">✕</button>';
  }

  /* ── Step 1: email ───────────────────────────────────────────── */
  function showAuthModal() {
    var card = openModal(
      closeBtn() +
      '<h2 class="am-heading">Welcome to<br>JVBNA Gyanshala</h2>' +
      '<div class="am-field"><label class="am-label" for="am-email">Email address</label>' +
        '<input class="am-input" id="am-email" type="email" placeholder="you@example.com" autocomplete="email"></div>' +
      '<button class="am-btn-primary" id="am-cont" type="button">Continue</button>' +
      '<div class="am-divider-or"><span></span>or<span></span></div>' +
      '<button class="am-btn-ghost" id="am-new" type="button">New here? Create account</button>'
    );
    card.querySelector('#auth-close').onclick = closeModal;
    var emailEl = card.querySelector('#am-email');
    var contBtn = card.querySelector('#am-cont');
    contBtn.onclick = function () {
      var v = emailEl.value.trim();
      if (!v || !v.includes('@')) { emailEl.style.borderColor = '#dc2626'; emailEl.focus(); return; }
      showSignInModal(v);
    };
    emailEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') contBtn.click(); });
    card.querySelector('#am-new').onclick = showSignUpModal;
  }

  /* ── Step 2a: sign in ────────────────────────────────────────── */
  function showSignInModal(email) {
    var card = openModal(
      closeBtn() +
      '<h2 class="am-heading">Welcome back</h2>' +
      '<div class="am-chip">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 6 10-6"/></svg>' +
        esc(email) +
      '</div>' +
      '<div class="am-field"><label class="am-label" for="am-pw">Password</label>' +
        '<div class="am-pw-wrap">' +
          '<input class="am-input" id="am-pw" type="password" placeholder="Enter your password" autocomplete="current-password">' +
          '<button class="am-eye" id="am-eye" type="button" aria-label="Show password">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<button class="am-btn-primary" id="am-signin" type="button">Sign In</button>' +
      '<button class="am-link" id="am-back" type="button">← Use a different email</button>'
    );
    card.querySelector('#auth-close').onclick = closeModal;
    card.querySelector('#am-back').onclick = showAuthModal;
    var pwEl = card.querySelector('#am-pw');
    card.querySelector('#am-eye').onclick = function () { pwEl.type = pwEl.type === 'password' ? 'text' : 'password'; };
    var signBtn = card.querySelector('#am-signin');
    signBtn.onclick = function () {
      if (!pwEl.value.trim()) { pwEl.focus(); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email, name: '' }));
      var p = getProfile();
      if (p && p.children && p.children.length) { closeModal(); refreshNavBtn(); }
      else showOnboardingModal();
    };
    pwEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') signBtn.click(); });
  }

  /* ── Step 2b: sign up ────────────────────────────────────────── */
  function showSignUpModal() {
    var card = openModal(
      closeBtn() +
      '<h2 class="am-heading">Create your account</h2>' +
      '<div class="am-field"><label class="am-label" for="am-name">Your name</label>' +
        '<input class="am-input" id="am-name" type="text" placeholder="e.g. Pragya Kothari" autocomplete="name"></div>' +
      '<div class="am-field"><label class="am-label" for="am-email2">Email address</label>' +
        '<input class="am-input" id="am-email2" type="email" placeholder="you@example.com" autocomplete="email"></div>' +
      '<button class="am-btn-primary" id="am-create" type="button">Create account</button>' +
      '<button class="am-link" id="am-back" type="button">← Already have an account? Sign in</button>'
    );
    card.querySelector('#auth-close').onclick = closeModal;
    card.querySelector('#am-back').onclick = showAuthModal;
    var nameEl  = card.querySelector('#am-name');
    var emailEl = card.querySelector('#am-email2');
    card.querySelector('#am-create').onclick = function () {
      var name = nameEl.value.trim(), email = emailEl.value.trim();
      if (!name)  { nameEl.style.borderColor  = '#dc2626'; nameEl.focus();  return; }
      if (!email || !email.includes('@')) { emailEl.style.borderColor = '#dc2626'; emailEl.focus(); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email, name: name }));
      showOnboardingModal();
    };
  }

  /* ── Step 3: onboarding ──────────────────────────────────────── */
  function showOnboardingModal() {
    childCounter = 0;
    var card = openModal(
      closeBtn() +
      '<h2 class="am-heading">Add your child(ren)</h2>' +
      '<p class="am-sub">You can update this any time.</p>' +
      '<div id="am-children"></div>' +
      '<button class="am-add-child" id="am-add-child" type="button">+ Add another child</button>' +
      '<p class="am-err" id="am-err" style="display:none"></p>' +
      '<button class="am-btn-primary" id="am-ob-go" type="button">Continue</button>'
    );
    card.querySelector('#auth-close').onclick = closeModal;
    var list = card.querySelector('#am-children');
    addChildBlock(list, true);
    card.querySelector('#am-add-child').onclick = function () { addChildBlock(list, false); };
    card.querySelector('#am-ob-go').onclick = function () {
      var blocks = list.querySelectorAll('.am-child');
      var children = [], firstErr = null;
      var errEl = card.querySelector('#am-err');
      blocks.forEach(function (b) {
        var cid = b.dataset.cid;
        var nameEl = document.getElementById('ac-n-' + cid);
        var name = nameEl ? nameEl.value.trim() : '';
        if (!name) { if (!firstErr) firstErr = nameEl; if (nameEl) nameEl.style.borderColor = '#dc2626'; return; }
        if (nameEl) nameEl.style.borderColor = '#d1d5db';
        children.push({ name: name, jain: document.getElementById('ac-j-' + cid).value, hindi: document.getElementById('ac-h-' + cid).value });
      });
      if (!children.length) { errEl.textContent = 'Please enter at least one child\'s name.'; errEl.style.display = 'block'; if (firstErr) firstErr.focus(); return; }
      errEl.style.display = 'none';
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ children: children }));
      showAllSetModal(children);
    };
  }

  function addChildBlock(list, isFirst) {
    var cid = childCounter++;
    if (!isFirst) {
      var sep = document.createElement('div'); sep.className = 'am-sep'; list.appendChild(sep);
    }
    var div = document.createElement('div');
    div.className = 'am-child'; div.dataset.cid = String(cid);
    div.innerHTML =
      '<div class="am-field"><label class="am-label" for="ac-n-' + cid + '">Child\'s name</label>' +
        '<input class="am-input" id="ac-n-' + cid + '" type="text" placeholder="Enter name" autocomplete="off"></div>' +
      '<div class="am-row">' +
        '<div class="am-field"><label class="am-label" for="ac-j-' + cid + '">Track / Class</label>' +
          '<select class="am-select" id="ac-j-' + cid + '"><option value="">Select</option>' +
          '<option>Sanskaar</option><option>Gyan</option><option>Darshan</option><option>Charitra</option></select></div>' +
        '<div class="am-field"><label class="am-label" for="ac-h-' + cid + '">Hindi level</label>' +
          '<select class="am-select" id="ac-h-' + cid + '"><option value="">Select</option>' +
          '<option>Beginner</option><option>Intermediate</option><option>Advanced</option>' +
          '<option value="none">Doesn\'t do Hindi</option></select></div>' +
      '</div>';
    list.appendChild(div);
    styleCard(div);
    if (!isFirst) { var inp = div.querySelector('.am-input'); if (inp) setTimeout(function () { inp.focus(); }, 50); }
  }

  /* ── Step 4: all set ─────────────────────────────────────────── */
  function showAllSetModal(children) {
    /* Build "Ayan & Arya" or "Ayan" or just empty */
    var names = '';
    if (children && children.length) {
      var nameList = children.map(function (c) { return esc(c.name || ''); }).filter(Boolean);
      if (nameList.length === 2) names = nameList[0] + ' &amp; ' + nameList[1];
      else if (nameList.length === 1) names = nameList[0];
    }
    var card = openModal(
      '<img src="images/walking-to-gyanshala.png" alt="" aria-hidden="true" style="width:140px;height:auto;margin:0 auto 12px;display:block;">' +
      '<h2 class="am-heading">You\'re all set' + (names ? ', ' + names + '!' : '!') + '</h2>' +
      '<p class="am-sub">Welcome to JVBNA Gyanshala!</p>' +
      '<button class="am-btn-accent" id="am-home" type="button" style="margin-top:20px">Go to Home</button>'
    );
    card.querySelector('#am-home').onclick = function () {
      closeModal(); refreshNavBtn();
      var p = window.location.pathname;
      if (p.indexOf('index') === -1 && !p.endsWith('/gyanshala/') && p !== '/') window.location.href = 'index.html';
    };
  }

  /* ── Account modal (signed in) ───────────────────────────────── */
  function showAccountModal() {
    var s = getSession();
    var card = openModal(
      closeBtn() +
      '<h2 class="am-heading">Your account</h2>' +
      (s && s.email ? '<p class="am-sub">' + esc(s.email) + '</p>' : '') +
      '<button class="am-btn-primary" id="am-edit" type="button">Edit children</button>' +
      '<button class="am-btn-signout" id="am-out" type="button">Sign out</button>'
    );
    card.style.height = 'auto';
    card.style.minHeight = '0';
    card.style.padding = '40px 32px 36px';
    card.querySelector('#auth-close').onclick = closeModal;
    card.querySelector('#am-edit').onclick = showOnboardingModal;
    var outBtn = card.querySelector('#am-out');
    outBtn.style.cssText = 'display:block;background:none;border:none;font-family:inherit;font-size:0.875rem;font-weight:500;color:#9ca3af;cursor:pointer;margin-top:16px;padding:0;text-align:center;width:100%;';
    outBtn.addEventListener('mouseover', function () { this.style.color = '#dc2626'; });
    outBtn.addEventListener('mouseout',  function () { this.style.color = '#9ca3af'; });
    outBtn.onclick = function () {
      localStorage.removeItem(SESSION_KEY); localStorage.removeItem(PROFILE_KEY);
      closeModal();
      window.location.href = 'index.html';
    };
  }

  /* ── Mobile sign-in prompt (bottom sheet) ───────────────────── */

  var LOCK_SVG =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="11" width="18" height="11" rx="2"/>' +
      '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
    '</svg>';

  function showMobileSignInPrompt() {
    if (window.innerWidth >= 768) return;
    if (getSession()) return;
    if (sessionStorage.getItem('gs_mobile_prompt')) return;
    sessionStorage.setItem('gs_mobile_prompt', '1');

    var overlay = document.createElement('div');
    overlay.id = 'gs-mobile-prompt';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'top:0', 'left:0', 'right:0', 'bottom:0',
      'background:rgba(15,23,60,0.45)',
      'z-index:9000',
      'display:flex',
      'align-items:flex-end',
      'justify-content:center'
    ].join(';');

    var sheet = document.createElement('div');
    sheet.style.cssText = [
      'background:#fff',
      'border-radius:22px 22px 0 0',
      'padding:28px 20px 44px',
      'width:100%',
      'max-width:520px',
      'box-shadow:0 -4px 32px rgba(15,23,60,0.18)',
      'position:relative',
      'box-sizing:border-box',
      'font-family:Inter,sans-serif'
    ].join(';');

    /* ── Dismiss (X) button ── */
    var xBtn = document.createElement('button');
    xBtn.type = 'button';
    xBtn.setAttribute('aria-label', 'Dismiss');
    xBtn.innerHTML = '&#x2715;';
    xBtn.style.cssText = 'position:absolute;top:14px;right:16px;background:none;border:none;font-size:1rem;color:#9ca3af;cursor:pointer;padding:4px 8px;border-radius:4px;line-height:1;';

    /* ── Icon + text row ── */
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:16px;margin-bottom:22px;';

    var iconWrap = document.createElement('div');
    iconWrap.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:center;';
    iconWrap.innerHTML = '<img src="images/sign-in.png" alt="" aria-hidden="true" style="width:76px;height:76px;object-fit:contain;">';

    var textWrap = document.createElement('div');
    textWrap.style.cssText = 'flex:1;min-width:0;';

    var heading = document.createElement('p');
    heading.style.cssText = 'font-family:Lora,Georgia,serif;font-size:1.05rem;font-weight:700;color:#1E3A80;margin:0 0 7px;line-height:1.3;';
    heading.innerHTML = 'See your children’s classes this week →';

    var desc = document.createElement('p');
    desc.style.cssText = 'font-size:0.8rem;color:#6b7280;margin:0;line-height:1.55;';
    desc.textContent = 'View schedule, homework, attendance and important updates in one place.';

    textWrap.appendChild(heading);
    textWrap.appendChild(desc);
    row.appendChild(iconWrap);
    row.appendChild(textWrap);

    /* ── Sign in button ── */
    var signInBtn = document.createElement('button');
    signInBtn.type = 'button';
    signInBtn.style.cssText = [
      'display:flex', 'align-items:center', 'justify-content:center', 'gap:8px',
      'width:100%', 'font-family:inherit', 'font-size:0.9375rem', 'font-weight:700',
      'background:#FFD039', 'color:#1E3A80',
      'border:none', 'border-radius:10px',
      'padding:14px 16px', 'cursor:pointer',
      'box-sizing:border-box', 'transition:opacity 0.15s'
    ].join(';');
    signInBtn.innerHTML = LOCK_SVG + ' Sign in to continue';

    function dismissPrompt() {
      var el = document.getElementById('gs-mobile-prompt');
      if (el) el.remove();
      unlockScroll();
    }

    xBtn.onclick = dismissPrompt;
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) dismissPrompt(); });
    signInBtn.addEventListener('mouseover', function () { this.style.opacity = '0.88'; });
    signInBtn.addEventListener('mouseout',  function () { this.style.opacity = '1'; });
    signInBtn.onclick = function () { dismissPrompt(); showAuthModal(); };

    sheet.appendChild(xBtn);
    sheet.appendChild(row);
    sheet.appendChild(signInBtn);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    lockScroll();
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  function _boot() {
    injectNavButton();
    setTimeout(showMobileSignInPrompt, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _boot);
  else _boot();

})();

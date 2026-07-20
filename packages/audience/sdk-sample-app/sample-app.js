// Sample app for @imtbl/audience.
// Vanilla ES2020, no build step. Reads the CDN bundle's window.ImmutableAudience.

(function () {
  'use strict';

  if (!window.ImmutableAudience) {
    document.body.textContent = 'ERROR: window.ImmutableAudience is undefined. The CDN bundle did not load.';
    return;
  }

  var audienceInit = window.ImmutableAudience.init;
  var IdentityType = window.ImmutableAudience.IdentityType;
  var SdkAudienceEvents = window.ImmutableAudience.AudienceEvents;
  var canIdentify = window.ImmutableAudience.canIdentify;
  var SDK_VERSION = window.ImmutableAudience.version || 'unknown';

  // Field shapes for typed events accordion. Cross-checked against AudienceEvents at bootstrap.
  var AUDIENCE_EVENTS = [
    { name: 'sign_up',          fields: [{ key: 'method', type: 'string', optional: true }] },
    { name: 'sign_in',          fields: [{ key: 'method', type: 'string', optional: true }] },
    { name: 'email_acquired',   fields: [{ key: 'source', type: 'string', optional: true }] },
    { name: 'wishlist_add',     fields: [
      { key: 'game_id', type: 'string' },
      { key: 'source', type: 'string', optional: true },
      { key: 'platform', type: 'string', optional: true },
    ] },
    { name: 'wishlist_remove',  fields: [{ key: 'game_id', type: 'string' }] },
    { name: 'purchase',         fields: [
      { key: 'currency', type: 'string' },
      { key: 'value', type: 'number' },
      { key: 'item_id', type: 'string', optional: true },
      { key: 'item_name', type: 'string', optional: true },
      { key: 'quantity', type: 'number', optional: true },
      { key: 'transaction_id', type: 'string', optional: true },
    ] },
    { name: 'game_launch',      fields: [
      { key: 'platform', type: 'string', optional: true },
      { key: 'version', type: 'string', optional: true },
      { key: 'build_id', type: 'string', optional: true },
    ] },
    { name: 'progression',      fields: [
      { key: 'status', type: 'enum', values: ['start', 'complete', 'fail'] },
      { key: 'world', type: 'string', optional: true },
      { key: 'level', type: 'string', optional: true },
      { key: 'stage', type: 'string', optional: true },
      { key: 'score', type: 'number', optional: true },
      { key: 'duration_sec', type: 'number', optional: true },
    ] },
    { name: 'resource',         fields: [
      { key: 'flow', type: 'enum', values: ['sink', 'source'] },
      { key: 'currency', type: 'string' },
      { key: 'amount', type: 'number' },
      { key: 'item_type', type: 'string', optional: true },
      { key: 'item_id', type: 'string', optional: true },
    ] },
    { name: 'game_page_viewed', fields: [
      { key: 'game_id', type: 'string' },
      { key: 'game_name', type: 'string', optional: true },
      { key: 'slug', type: 'string', optional: true },
    ] },
    { name: 'link_clicked',     fields: [
      { key: 'url', type: 'string' },
      { key: 'label', type: 'string', optional: true },
      { key: 'source', type: 'string', optional: true },
      { key: 'game_id', type: 'string', optional: true },
    ] },
  ];

  var audience = null;
  var currentConsent = null;
  var currentUserId = null;

  var identityMirror = emptyIdentity();
  var logEntries = [];
  var logAutoScroll = true;
  var MAX_LOG_ENTRIES = 500;
  var LOG_BOTTOM_THRESHOLD = 20;

  // SDK-writable first-party cookies (shared with @imtbl/pixel).
  var ANON_COOKIE_NAME = 'imtbl_anon_id';

  function readCookie(name) {
    var pattern = new RegExp('(?:^|;\\s*)' + name + '=([^;]+)');
    var match = document.cookie.match(pattern);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // DOM helpers
  function $(id) { return document.getElementById(id); }
  function text(el, val) { el.textContent = val; }
  function errMsg(err) { return String(err && err.message || err); }
  function create(tag, className) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }
  function addOption(select, value, label) {
    var opt = create('option');
    opt.value = value;
    text(opt, label);
    select.appendChild(opt);
  }
  function emptyIdentity() { return { userId: null, identityType: null, traits: null, aliases: [] }; }

  // --- Event log (source: 'app' | 'sdk') ---

  function log(label, payload, level, source) {
    var entry = {
      ts: new Date().toISOString(),
      label: label,
      payload: payload,
      level: level || 'info',
      source: source || 'app',
    };
    logEntries.push(entry);
    if (logEntries.length > MAX_LOG_ENTRIES) {
      logEntries.shift();
      var logEl = $('log');
      if (logEl.firstChild) logEl.removeChild(logEl.firstChild);
    }
    renderLogEntry(entry);
    updateLogCount();
  }

  function formatLogBody(payload) {
    if (payload == null) return '';
    if (typeof payload === 'string') return payload;
    try { return JSON.stringify(payload, null, 2); }
    catch (err) { return String(payload); }
  }

  function renderLogEntry(entry) {
    var row = create('div', 'log-row log-' + entry.level);
    var head = create('div', 'log-row-head');
    var bodyText = formatLogBody(entry.payload);

    var ts = create('span', 'log-ts');
    text(ts, entry.ts.slice(11, 23));

    var badge = create('span', 'log-badge ' + (entry.source === 'sdk' ? 'badge-sdk' : 'badge-app'));
    text(badge, entry.source === 'sdk' ? 'SDK' : 'APP');

    var label = create('span', 'log-label');
    text(label, entry.label);

    var copyBtn = create('button', 'secondary log-copy-btn');
    copyBtn.type = 'button';
    copyBtn.innerHTML = COPY_ICON_HTML;
    copyBtn.setAttribute('aria-label', 'Copy log entry');
    copyBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      copyToClipboard(bodyText, copyBtn, true);
    });

    head.appendChild(ts);
    head.appendChild(badge);
    head.appendChild(label);
    head.appendChild(copyBtn);
    row.appendChild(head);

    if (bodyText) {
      var body = create('pre', 'log-body');
      text(body, bodyText);
      row.appendChild(body);
      // Click or Enter/Space on the row head toggles collapse/expand.
      var isCollapsed = bodyText.length > 240;
      row.classList.add('collapsible');
      head.setAttribute('tabindex', '0');
      head.setAttribute('role', 'button');
      head.setAttribute('aria-expanded', String(!isCollapsed));
      function toggleCollapse() {
        row.classList.toggle('collapsed');
        head.setAttribute('aria-expanded', String(!row.classList.contains('collapsed')));
      }
      head.addEventListener('click', toggleCollapse);
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCollapse();
        }
      });
      // Long bodies default-collapsed so the log doesn't bloat.
      if (isCollapsed) row.classList.add('collapsed');
    }

    $('log').appendChild(row);
    if (logAutoScroll) $('log').scrollTop = $('log').scrollHeight;
  }

  function clearLog() { logEntries.length = 0; $('log').textContent = ''; updateLogCount(); }

  function updateLogCount() { text($('log-count'), String(logEntries.length)); }

  var COPY_ICON_HTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var COPY_CHECK_ICON_HTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function copyToClipboard(str, btn, isIcon) {
    navigator.clipboard.writeText(str).then(function () {
      flashCopied(btn, isIcon);
    }).catch(function () {});
  }

  function flashCopied(el, isIcon) {
    if (el.dataset.copyTimer) clearTimeout(Number(el.dataset.copyTimer));
    if (isIcon) el.innerHTML = COPY_CHECK_ICON_HTML;
    else el.textContent = 'Copied';
    var timerId = setTimeout(function () {
      if (isIcon) el.innerHTML = COPY_ICON_HTML;
      else el.textContent = 'Copy';
      delete el.dataset.copyTimer;
    }, 1200);
    el.dataset.copyTimer = String(timerId);
  }

  var activeTabId = 'panel-setup';

  // --- UI state persistence (localStorage, dev-only) ---

  var UI_STATE_KEY = 'imtbl_audience_sample_app_ui_v1';

  var UI_FIELDS = [
    ['pk', 'value', 'pk'],
    ['initial-consent', 'value', 'initialConsent'],
    ['debug', 'checked', 'debug'],
    ['test-mode', 'checked', 'testMode'],
    ['cookie-domain', 'value', 'cookieDomain'],
    ['flush-interval', 'value', 'flushInterval'],
    ['flush-size', 'value', 'flushSize'],
    ['environment', 'value', 'environment'],
  ];

  function saveUiState() {
    try {
      var state = { activeTab: activeTabId };
      UI_FIELDS.forEach(function (f) { state[f[2]] = $(f[0])[f[1]]; });
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(state));
    } catch (err) { /* storage unavailable */ }
  }

  function restoreUiState() {
    try {
      var raw = localStorage.getItem(UI_STATE_KEY);
      if (!raw) return;
      var state = JSON.parse(raw);
      UI_FIELDS.forEach(function (f) { if (state[f[2]] !== undefined) $(f[0])[f[1]] = state[f[2]]; });
      if ($('environment').selectedIndex === -1) $('environment').selectedIndex = 0;
      return state;
    } catch (err) { /* ignore */ }
  }

  // --- SDK debug console mirror ---
  // Wraps console.log/warn to mirror [audience]-prefixed messages into
  // the in-page event log. Original console methods stay active.

  // Harvested from the debug mirror (reliable) or cookies (fallback).
  var currentAnonId = null;
  var currentSessionId = null;
  var pendingQueueCount = 0;

  function installConsoleMirror() {
    var originalLog = console.log.bind(console);
    var originalWarn = console.warn.bind(console);

    function harvestIds(payload) {
      if (!payload || typeof payload !== 'object') return;
      var changed = false;
      if (typeof payload.anonymousId === 'string' && payload.anonymousId && currentAnonId !== payload.anonymousId) {
        currentAnonId = payload.anonymousId;
        changed = true;
      }
      var sid = payload.sessionId;
      if (typeof sid === 'string' && sid && currentSessionId !== sid) {
        currentSessionId = sid;
        changed = true;
      }
      if (changed) updateStatus();
    }

    function tryMirror(args, level) {
      if (args.length === 0 || typeof args[0] !== 'string') return;
      if (args[0].indexOf('[audience] ') !== 0) return;
      var msg = args[0].slice(11);
      var payload = args.length > 1 ? args[1] : undefined;
      harvestIds(payload);
      // Promote flush outcomes to ok/err so they stand out in the log.
      var flushMatch = msg.match(/^flush (ok|failed)/);
      if (flushMatch && flushMatch[1] === 'ok') { pendingQueueCount = 0; updateStatus(); }
      var effectiveLevel = flushMatch ? (flushMatch[1] === 'ok' ? 'ok' : 'err') : level;
      log(msg, payload, effectiveLevel, 'sdk');
    }

    console.log = function () {
      originalLog.apply(null, arguments);
      tryMirror(arguments, 'debug');
    };
    console.warn = function () {
      originalWarn.apply(null, arguments);
      tryMirror(arguments, 'warn');
    };
  }

  function isTestKey(key) { return key.indexOf('pk_imapik-test') === 0; }

  var DEV_URL = 'https://api.dev.immutable.com';
  var PROD_URL = 'https://api.immutable.com';

  var lastKeyType = null; // 'test' | 'prod' | null
  function syncEnvironment() {
    var key = $('pk').value.trim();
    if (!key) { lastKeyType = null; return; }
    var type = isTestKey(key) ? 'test' : 'prod';
    if (type === lastKeyType) return;
    lastKeyType = type;
    $('environment').value = type === 'test' ? DEV_URL : PROD_URL;
  }

  function handleError(err) {
    var info = {};
    ['name', 'code', 'status', 'endpoint', 'message', 'responseBody'].forEach(function (k) {
      if (err && err[k] !== undefined) info[k] = err[k];
    });
    log('onError', info, 'err');
  }

  function readConfig() {
    var config = {
      publishableKey: $('pk').value.trim(),
      consent: $('initial-consent').value,
      debug: $('debug').checked,
      onError: handleError,
    };
    if ($('test-mode').checked) config.testMode = true;
    var cd = $('cookie-domain').value.trim(); if (cd) config.cookieDomain = cd;
    config.baseUrl = $('environment').value;
    var fi = parseInt($('flush-interval').value, 10); if (!Number.isNaN(fi)) config.flushInterval = fi;
    var fs = parseInt($('flush-size').value, 10); if (!Number.isNaN(fs)) config.flushSize = fs;
    return config;
  }

  // --- Init button gating ---

  function syncInitEnabled() {
    $('btn-init').disabled = $('pk').value.trim() === '' || audience !== null;
  }

  var SDK_BUTTONS = [
    'btn-page', 'btn-flush', 'btn-reset', 'btn-shutdown',
    'btn-consent-none', 'btn-consent-anon', 'btn-consent-full',
    'btn-custom-event',
    'btn-identify',
    'btn-identify-invalid-example',
    'btn-delete-data',
  ];

  function setInitState(on) {
    $('btn-init').disabled = on;
    SDK_BUTTONS.forEach(function (id) {
      var el = $(id);
      if (el) el.disabled = !on;
    });
    var typedButtons = document.querySelectorAll('#typed-events-accordion .accordion-item button');
    for (var i = 0; i < typedButtons.length; i++) typedButtons[i].disabled = !on;
    $('btn-alias').disabled = true;
    if (on) syncAliasButton();
  }

  var CONSENT_BUTTONS = { none: 'btn-consent-none', anonymous: 'btn-consent-anon', full: 'btn-consent-full' };
  function syncConsentPills() {
    Object.keys(CONSENT_BUTTONS).forEach(function (level) {
      $(CONSENT_BUTTONS[level]).classList.toggle('active', currentConsent === level);
    });
  }

  function updateStatus() {
    syncConsentPills();
    var anonId = null;
    if (audience) {
      anonId = currentAnonId || readCookie(ANON_COOKIE_NAME);
    }

    // Pre-init: mirror the form's Initial consent value.
    var displayConsent = currentConsent;
    if (!audience) {
      var initialConsent = $('initial-consent').value;
      if (initialConsent) displayConsent = initialConsent;
    }

    var ep = $('environment').value;
    var isProd = ep === PROD_URL;
    var consentTint = { none: ' state-err', anonymous: ' state-warn', full: ' state-ok' }[displayConsent] || '';
    var endpointTint = isProd ? ' state-warn' : ' state-ok';
    $('prod-warning').hidden = !isProd;
    var anonCookie = readCookie(ANON_COOKIE_NAME);
    var sidCookie = readCookie('_imtbl_sid');

    [
      ['status-endpoint', ep, endpointTint],
      ['status-consent', displayConsent || '—', consentTint],
      ['status-anon', anonId || '—', anonId ? '' : ' dim'],
      ['status-user', currentUserId || '—', currentUserId ? '' : ' dim'],
      ['status-session', currentSessionId || '—', currentSessionId ? '' : ' dim'],
      ['status-queue', audience ? String(pendingQueueCount) : '—', audience ? '' : ' dim'],
      ['status-cookie-anon', anonCookie || '—', anonCookie ? '' : ' dim'],
      ['status-cookie-sid', sidCookie || '—', sidCookie ? '' : ' dim'],
    ].forEach(function (c) {
      var el = $(c[0]);
      text(el, c[1]);
      el.className = 'status-value' + c[2];
    });
  }

  // --- Setup panel: Init ---

  function onInit() {
    try {
      var config = readConfig();
      audience = audienceInit(config);
      setInitState(true);
      currentConsent = config.consent;
      log('INIT', {
        consent: config.consent,
        debug: config.debug,
        testMode: config.testMode || false,
        cookieDomain: config.cookieDomain,
        flushInterval: config.flushInterval,
        flushSize: config.flushSize,
        baseUrl: config.baseUrl,
      }, 'ok');
      updateStatus();
    } catch (err) {
      log('INIT', errMsg(err), 'err');
    }
  }

  function clearSdkCookies() {
    var expired = '; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    [ANON_COOKIE_NAME, '_imtbl_sid'].forEach(function (name) {
      document.cookie = name + '=' + expired;
    });
    updateStatus();
    log('cookies', 'Cleared SDK cookies', 'info', 'app');
  }

  // --- Identity state mirror ---

  function resetLocalState() {
    currentUserId = null;
    currentAnonId = null;
    currentSessionId = null;
    pendingQueueCount = 0;
    identityMirror = emptyIdentity();
    renderIdentityState();
  }

  function setIdentityRow(key, value) {
    var dd = document.querySelector('.identity-state-row[data-key="' + key + '"] dd');
    if (dd) text(dd, value || '—');
  }

  function renderIdentityState() {
    setIdentityRow('userId',       identityMirror.userId);
    setIdentityRow('identityType', identityMirror.identityType);
    setIdentityRow('traits',       identityMirror.traits ? JSON.stringify(identityMirror.traits) : null);
    setIdentityRow('aliases',      identityMirror.aliases.length
      ? identityMirror.aliases.map(function (a) {
        return a.from.identityType + ':' + a.from.id + ' \u2192 ' + a.to.identityType + ':' + a.to.id;
      }).join('\n')
      : null);
  }

  // --- Event catalogue drift check ---
  // Warn if local AUDIENCE_EVENTS diverges from the SDK's AudienceEvents.

  function validateEventCatalogue() {
    if (!SdkAudienceEvents) return;
    var sdkNames = Object.values(SdkAudienceEvents);
    var localNames = AUDIENCE_EVENTS.map(function (e) { return e.name; });
    var missing = sdkNames.filter(function (n) { return localNames.indexOf(n) === -1; });
    var extra = localNames.filter(function (n) { return sdkNames.indexOf(n) === -1; });
    if (missing.length || extra.length) {
      log('drift', { sdkHasButSampleAppMissing: missing, sampleAppHasButSdkMissing: extra }, 'warn');
    }
  }

  // --- Tab switching ---

  function installTabSwitching() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab-bar .tab'));
    if (!tabs.length) return;

    function activate(targetPanelId, moveFocus) {
      activeTabId = targetPanelId;
      saveUiState();
      for (var i = 0; i < tabs.length; i++) {
        var isActive = tabs[i].getAttribute('data-panel') === targetPanelId;
        tabs[i].classList.toggle('active', isActive);
        tabs[i].setAttribute('aria-selected', String(isActive));
        tabs[i].setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive && moveFocus) tabs[i].focus();
      }
      var panels = document.querySelectorAll('.controls .panel');
      for (var j = 0; j < panels.length; j++) {
        panels[j].classList.toggle('active', panels[j].id === targetPanelId);
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { activate(tab.getAttribute('data-panel')); });
    });

    // ARIA tablist keyboard navigation.
    document.querySelector('.tab-bar').addEventListener('keydown', function (e) {
      var current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      var next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      activate(tabs[next].getAttribute('data-panel'), true);
    });
  }

  // --- Bootstrap ---

  function bootstrap() {
    installConsoleMirror();
    validateEventCatalogue();
    installTabSwitching();
    var restored = restoreUiState();
    var restoredKey = $('pk').value.trim();
    if (restoredKey) lastKeyType = isTestKey(restoredKey) ? 'test' : 'prod';

    var identityTypes = Object.values(IdentityType || {});
    ['id-type', 'alias-from-type', 'alias-to-type'].forEach(function (id) {
      identityTypes.forEach(function (val) { addOption($(id), val, val); });
    });

    $('pk').addEventListener('input', function () {
      syncEnvironment(); syncInitEnabled(); updateStatus(); saveUiState();
    });
    $('environment').addEventListener('change', function () { updateStatus(); saveUiState(); });
    $('initial-consent').addEventListener('change', function () { saveUiState(); updateStatus(); });
    ['debug', 'test-mode', 'cookie-domain', 'flush-interval', 'flush-size'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', saveUiState);
    });
    $('btn-init').addEventListener('click', onInit);
    $('btn-page').addEventListener('click', onPage);
    $('btn-flush').addEventListener('click', onFlush);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-shutdown').addEventListener('click', onShutdown);
    $('btn-consent-none').addEventListener('click', function () { onSetConsent('none'); });
    $('btn-consent-anon').addEventListener('click', function () { onSetConsent('anonymous'); });
    $('btn-consent-full').addEventListener('click', function () { onSetConsent('full'); });
    $('btn-identify').addEventListener('click', onIdentify);
    $('btn-identify-invalid-example').addEventListener('click', function () {
      $('id-id').value = '12345';
      $('id-type').value = IdentityType.Passport;
      saveUiState();
    });
    $('btn-alias').addEventListener('click', onAlias);
    $('btn-delete-data').addEventListener('click', onDeleteData);
    ['alias-from-id', 'alias-to-id', 'alias-from-type', 'alias-to-type'].forEach(function (id) {
      $(id).addEventListener('input', syncAliasButton);
    });
    $('btn-clear-cookies').addEventListener('click', clearSdkCookies);
    document.querySelector('.status-bar').addEventListener('click', function (e) {
      var val = e.target.closest('.status-value');
      if (!val || val.textContent === '—') return;
      var original = val.textContent;
      navigator.clipboard.writeText(original).then(function () {
        val.textContent = 'Copied';
        val.classList.add('copied');
        setTimeout(function () { val.textContent = original; val.classList.remove('copied'); }, 800);
      }).catch(function () {});
    });

    $('btn-copy-log').addEventListener('click', function () {
      var s = logEntries.map(function (e) {
        return e.ts + ' [' + (e.source === 'sdk' ? 'SDK' : 'APP') + '] '
          + e.label + ' ' + (typeof e.payload === 'string' ? e.payload : JSON.stringify(e.payload));
      }).join('\n');
      copyToClipboard(s, $('btn-copy-log'));
    });
    $('btn-clear-log').addEventListener('click', clearLog);
    $('log').addEventListener('scroll', function () {
      var el = $('log');
      logAutoScroll = (el.scrollHeight - el.scrollTop - el.clientHeight) < LOG_BOTTOM_THRESHOLD;
    });

    var typedContainer = $('typed-events-accordion');
    typedContainer.textContent = '';
    AUDIENCE_EVENTS.forEach(function (event) { renderTypedEventRow(event, typedContainer); });
    $('btn-custom-event').addEventListener('click', onCustomEvent);

    syncInitEnabled();
    updateStatus();
    text($('sdk-version'), 'v' + SDK_VERSION);
    renderIdentityState();

    if (restored && restored.activeTab && restored.activeTab !== 'panel-setup') {
      var tabBtn = document.querySelector('.tab-bar .tab[data-panel="' + restored.activeTab + '"]');
      if (tabBtn) tabBtn.click();
    }

    log('READY', 'Sample app loaded. Paste a publishable key and click Init.', 'info');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // --- Queue count (app-level tracking, works without debug mode) ---

  function enqueued() {
    pendingQueueCount += 1;
    updateStatus();
  }

  // --- SDK lifecycle ---

  function onPage() {
    if (!audience) return;
    try {
      var props = { path: window.location.pathname };
      audience.page(props);
      enqueued();
      log('page()', props, 'ok');
    } catch (err) {
      log('page()', errMsg(err), 'err');
    }
  }

  function onFlush() {
    if (!audience) return;
    audience.flush().then(function () {
      pendingQueueCount = 0;
      updateStatus();
      log('flush()', 'queue flushed', 'ok');
    }).catch(function (err) {
      log('flush()', errMsg(err), 'err');
    });
  }

  function onReset() {
    if (!audience) return;
    log('reset()', { clearing: { anonId: currentAnonId, userId: currentUserId, sessionId: currentSessionId } }, 'info');
    audience.reset();
    resetLocalState();
    log('reset()', 'anonymous ID regenerated, queue cleared', 'ok');
    updateStatus();
  }

  function onShutdown() {
    if (!audience) return;
    log('shutdown()', { clearing: { anonId: currentAnonId, userId: currentUserId, sessionId: currentSessionId, consent: currentConsent } }, 'info');
    audience.shutdown();
    audience = null;
    currentConsent = null;
    resetLocalState();
    setInitState(false);
    syncInitEnabled();
    updateStatus();
    log('shutdown()', 'SDK stopped', 'ok');
  }

  // --- Consent panel ---

  function onSetConsent(level) {
    if (!audience) return;
    var previous = currentConsent;
    try {
      audience.setConsent(level);
      currentConsent = level;
      // Log observable side effects of the transition.
      var effects = [];
      if (previous === 'none' && level !== 'none') effects.push('queue started, session created');
      if (level === 'none') effects.push('tracking stopped, cookies deleted (queued events kept)');
      if (!canIdentify(level)) {
        currentUserId = null;
        identityMirror = emptyIdentity();
        renderIdentityState();
        if (canIdentify(previous)) effects.push('userId cleared');
      }
      log('setConsent()', { from: previous, to: level, effects: effects.length ? effects : undefined }, 'ok');
      updateStatus();
    } catch (err) {
      log('setConsent()', errMsg(err), 'err');
    }
  }

  function renderTypedEventRow(event, container) {
    var row = create('details', 'accordion-item');
    var summary = create('summary', 'accordion-header');
    var title = create('span', 'accordion-title');
    text(title, event.name);
    summary.appendChild(title);
    row.appendChild(summary);

    var content = create('div', 'accordion-content');
    row.appendChild(content);

    var inputsByKey = {};
    event.fields.forEach(function (field) {
      var fieldEl = create('div', 'field');
      var inputId = 'te-' + event.name + '-' + field.key;
      var label = create('label');
      label.setAttribute('for', inputId);
      text(label, field.key + (field.optional ? '?' : '') + ': ' + (field.values ? field.values.join(' | ') : field.type));
      fieldEl.appendChild(label);

      var input;
      if (field.type === 'enum') {
        input = create('select');
        if (field.optional) addOption(input, '', '(not set)');
        field.values.forEach(function (v) { addOption(input, v, v); });
      } else {
        input = create('input');
        input.type = field.type === 'number' ? 'number' : 'text';
      }
      input.id = inputId;
      fieldEl.appendChild(input);
      content.appendChild(fieldEl);
      inputsByKey[field.key] = { input: input, field: field };
    });

    var actions = create('div', 'actions');
    var btn = create('button');
    text(btn, 'Send');
    btn.disabled = true;
    actions.appendChild(btn);
    content.appendChild(actions);

    function collectProps() {
      var props = {};
      Object.keys(inputsByKey).forEach(function (key) {
        var entry = inputsByKey[key];
        var raw = entry.input.value;
        if (raw === '') return;
        if (entry.field.type === 'number') {
          var n = Number(raw);
          if (Number.isNaN(n)) return;
          props[key] = n;
        } else {
          props[key] = raw;
        }
      });
      return props;
    }

    btn.addEventListener('click', function () {
      if (!audience) return;
      var props = collectProps();
      try {
        audience.track(event.name, props);
        enqueued();
        log('track()', { event: event.name, properties: props }, 'ok');
      } catch (err) {
        log('track()', errMsg(err), 'err');
      }
    });

    container.appendChild(row);
  }

  function onCustomEvent() {
    if (!audience) return;
    var name = $('custom-event-name').value.trim();
    if (!name) { log('track()', 'event name required', 'err'); return; }
    try {
      var propsText = $('custom-event-props').value.trim();
      var props = propsText ? JSON.parse(propsText) : undefined;
      audience.track(name, props);
      enqueued();
      log('track()', { event: name, properties: props }, 'ok');
    } catch (err) {
      log('track()', errMsg(err), 'err');
    }
  }

  // --- Identity panel ---

  function requiresFullConsent(label) {
    if (canIdentify(currentConsent)) return true;
    log(label, 'skipped — canIdentify(' + currentConsent + ') is false; requires consent: full', 'info');
    return false;
  }

  function parseTraits(raw) {
    var trimmed = (raw || '').trim();
    if (!trimmed) return undefined;
    return JSON.parse(trimmed);
  }

  function onIdentify() {
    if (!audience) return;
    if (!requiresFullConsent('identify()')) return;
    var id = $('id-id').value.trim();
    var type = $('id-type').value;
    if (!id) {
      log('identify()', 'id required', 'err');
      return;
    }
    var traits;
    try { traits = parseTraits($('id-traits').value); }
    catch (err) { log('identify()', 'invalid traits JSON: ' + err.message, 'err'); return; }
    try {
      audience.identify(id, type, traits);
      enqueued();
      currentUserId = id;
      identityMirror.userId = id;
      identityMirror.identityType = type;
      identityMirror.traits = traits || null;
      renderIdentityState();
      log('identify()', { id: id, identityType: type, traits: traits }, 'ok');
      updateStatus();
    } catch (err) {
      log('identify()', errMsg(err), 'err');
    }
  }

  function onAlias() {
    if (!audience) return;
    if (!requiresFullConsent('alias()')) return;
    var fromId = $('alias-from-id').value.trim();
    var fromType = $('alias-from-type').value;
    var toId = $('alias-to-id').value.trim();
    var toType = $('alias-to-type').value;
    // Matches the SDK: ids alone decide equality, identityType isn't a factor.
    if (!fromId || !toId || fromId === toId) {
      log('alias()', 'from and to must both be set and differ', 'err');
      return;
    }
    var from = { id: fromId, identityType: fromType };
    var to = { id: toId, identityType: toType };
    try {
      audience.alias(from, to);
      enqueued();
      identityMirror.aliases.push({ from: from, to: to });
      renderIdentityState();
      log('alias()', { from: from, to: to }, 'ok');
    } catch (err) {
      log('alias()', errMsg(err), 'err');
    }
  }

  function onDeleteData() {
    if (!audience) return;
    var userId = $('delete-data-user-id').value.trim() || undefined;
    var label = 'deleteData(' + (userId ? JSON.stringify(userId) : '') + ')';
    audience.deleteData(userId).then(function () {
      log(label, userId ? { userId: userId } : { anonymousId: 'current' }, 'ok');
    }).catch(function (err) {
      log(label, errMsg(err), 'err');
    });
  }

  function syncAliasButton() {
    var btn = $('btn-alias');
    if (!audience) { btn.disabled = true; return; }
    var fromId = $('alias-from-id').value.trim();
    var fromType = $('alias-from-type').value;
    var toId = $('alias-to-id').value.trim();
    var toType = $('alias-to-type').value;
    btn.disabled = !fromId || !toId || (fromId === toId && fromType === toType);
  }

}());

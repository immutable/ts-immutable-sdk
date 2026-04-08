/*
 * Demo script for @imtbl/audience.
 *
 * Vanilla ES2020 — no modules, no imports. Reads window.ImmutableAudience
 * that the CDN bundle attaches. CSP-safe: all event wiring via
 * addEventListener, all DOM rendering via createElement + textContent.
 */

(function () {
  'use strict';

  if (!window.ImmutableAudience) {
    document.body.innerText = 'ERROR: window.ImmutableAudience is undefined. The CDN bundle did not load.';
    return;
  }

  var Audience = window.ImmutableAudience.Audience;
  var IdentityType = window.ImmutableAudience.IdentityType;

  // State
  var audience = null;
  var currentUserId = null;
  var currentConsent = null;
  var logEntries = [];
  var MAX_LOG_ENTRIES = 500;

  // DOM helpers
  function $(id) { return document.getElementById(id); }

  function text(el, val) { el.textContent = val; return el; }

  function create(tag, className) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  function getRadio(name) {
    var radios = document.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return null;
  }

  function parseJsonOrWarn(txt, label) {
    var trimmed = (txt || '').trim();
    if (!trimmed) return undefined;
    try {
      var parsed = JSON.parse(trimmed);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        log('WARN', label + ': JSON must be an object', 'warn');
        return null;
      }
      return parsed;
    } catch (err) {
      log('WARN', label + ': invalid JSON — ' + String(err && err.message || err), 'warn');
      return null;
    }
  }

  function populateIdentityDropdowns() {
    var selectIds = ['identify-type', 'alias-from-type', 'alias-to-type'];
    var values = Object.keys(IdentityType).map(function (key) {
      return { key: key, value: IdentityType[key] };
    });

    for (var i = 0; i < selectIds.length; i++) {
      var sel = $(selectIds[i]);
      if (!sel || sel.options.length > 0) continue;
      for (var j = 0; j < values.length; j++) {
        var opt = document.createElement('option');
        opt.value = values[j].value;
        opt.textContent = values[j].value;
        sel.appendChild(opt);
      }
    }
    $('alias-to-type').value = IdentityType.Passport;
  }

  // Log
  function log(method, detail, type) {
    type = type || 'info';
    var now = new Date().toISOString();
    logEntries.push({ time: now, method: method, detail: detail, type: type });
    if (logEntries.length > MAX_LOG_ENTRIES) logEntries.shift();
    renderLog();
  }

  function renderLog() {
    var container = $('log');
    container.innerHTML = '';
    for (var i = 0; i < logEntries.length; i++) {
      var e = logEntries[i];
      var entry = create('div', 'log-entry ' + (e.type === 'ok' ? 'ok' : e.type === 'err' ? 'err' : e.type === 'warn' ? 'warn' : ''));

      var timeEl = create('span', 'log-time');
      text(timeEl, e.time);

      var methodEl = create('span', 'log-method');
      text(methodEl, e.method);

      var detailStr;
      if (e.detail == null) {
        detailStr = '';
      } else if (typeof e.detail === 'object') {
        try {
          detailStr = JSON.stringify(e.detail, null, 2);
        } catch (err) {
          detailStr = '[unserializable detail: ' + String(err && err.message) + ']';
        }
      } else {
        detailStr = String(e.detail);
      }

      entry.appendChild(timeEl);
      entry.appendChild(methodEl);

      // For error entries with multi-line JSON, render a block; otherwise inline span.
      var isMultiline = detailStr.indexOf('\n') !== -1;
      if (isMultiline || e.type === 'err') {
        var br = document.createElement('br');
        entry.appendChild(br);
        var pre = create('span', 'log-detail');
        text(pre, detailStr);
        entry.appendChild(pre);
      } else {
        var detailEl = create('span', 'log-detail');
        text(detailEl, detailStr);
        entry.appendChild(detailEl);
      }

      container.appendChild(entry);
    }
    container.scrollTop = container.scrollHeight;
    var countText = logEntries.length + ' entries';
    if (logEntries.length >= MAX_LOG_ENTRIES) {
      countText += ' (capped at ' + MAX_LOG_ENTRIES + ')';
    }
    text($('log-count'), countText);
  }

  function clearLog() {
    logEntries = [];
    renderLog();
  }

  // Status bar
  function updateStatus() {
    var env = audience ? getRadio('env') : '—';
    text($('status-env'), env || '—');
    $('status-env').className = 'status-value' + (audience ? '' : ' dim');

    var consent = audience ? (currentConsent || '—') : '—';
    var consentEl = $('status-consent');
    text(consentEl, consent);
    // Rebuild className fresh each update so we don't accumulate stale state classes.
    var consentClass = 'status-value';
    if (!audience || !currentConsent) {
      consentClass += ' dim';
    } else {
      consentClass += ' consent-' + currentConsent;
    }
    consentEl.className = consentClass;

    var anonCookie = document.cookie.match(/imtbl_anon_id=([^;]*)/);
    text($('status-anon'), anonCookie ? decodeURIComponent(anonCookie[1]) : '—');
    $('status-anon').className = 'status-value' + (anonCookie ? '' : ' dim');

    text($('status-user'), currentUserId || '—');
    $('status-user').className = 'status-value' + (currentUserId ? '' : ' dim');
  }

  // Sync the Init button's enabled state based on the publishable key field content.
  // Declared as a function declaration so it is hoisted and can be called from
  // setInitState below without a forward-reference guard.
  function syncInitEnabled() {
    if (audience) return;
    var initBtn = $('btn-init');
    var pkInput = $('pk');
    initBtn.disabled = pkInput.value.trim().length === 0;
  }

  // Enable/disable controls based on init state
  function setInitState(on) {
    $('btn-init').disabled = on;
    $('btn-shutdown').disabled = !on;
    $('btn-reset').disabled = !on;
    $('btn-flush').disabled = !on;
    $('btn-page').disabled = !on;
    $('btn-track').disabled = !on;
    $('btn-identify').disabled = !on;
    $('btn-identify-traits').disabled = !on;
    $('btn-alias').disabled = !on;
    $('pk').disabled = on;
    $('flush-interval').disabled = on;
    $('flush-size').disabled = on;
    var envRadios = document.querySelectorAll('input[name="env"]');
    for (var i = 0; i < envRadios.length; i++) envRadios[i].disabled = on;
    var consentRadios = document.querySelectorAll('input[name="initial-consent"]');
    for (var j = 0; j < consentRadios.length; j++) consentRadios[j].disabled = on;
    if (!on) syncInitEnabled();
  }

  // onError handler passed to Audience.init
  function handleError(err) {
    var code = err && err.code ? err.code : 'UNKNOWN';
    var summary = code + (err && err.status ? ' (' + err.status + ')' : '');
    log('ERROR ' + summary, err && err.responseBody != null ? err.responseBody : String(err && err.message), 'err');
  }

  // Button handlers
  function onInit() {
    var pk = $('pk').value.trim();
    var env = getRadio('env');
    var consent = getRadio('initial-consent');
    var debug = $('debug').checked;

    // Optional advanced config: flushInterval / flushSize.
    // Empty input → omit → SDK uses its defaults (5000ms / 20 items).
    var flushIntervalRaw = $('flush-interval').value.trim();
    var flushSizeRaw = $('flush-size').value.trim();
    var flushInterval;
    var flushSize;

    if (flushIntervalRaw) {
      flushInterval = parseInt(flushIntervalRaw, 10);
      if (isNaN(flushInterval) || flushInterval <= 0) {
        log('WARN', 'Flush interval must be a positive integer in milliseconds', 'warn');
        return;
      }
    }
    if (flushSizeRaw) {
      flushSize = parseInt(flushSizeRaw, 10);
      if (isNaN(flushSize) || flushSize <= 0) {
        log('WARN', 'Flush batch size must be a positive integer', 'warn');
        return;
      }
    }

    var config = {
      publishableKey: pk,
      environment: env,
      consent: consent,
      debug: debug,
      onError: handleError,
    };
    if (flushInterval !== undefined) config.flushInterval = flushInterval;
    if (flushSize !== undefined) config.flushSize = flushSize;

    try {
      audience = Audience.init(config);
      setInitState(true);
      currentConsent = consent;
      log('INIT', {
        environment: env,
        consent: consent,
        debug: debug,
        flushInterval: flushInterval,
        flushSize: flushSize,
      }, 'ok');
    } catch (err) {
      log('INIT', String(err && err.message || err), 'err');
      return;
    }
    updateConsentButtons();
    updateStatus();
  }

  function onShutdown() {
    if (!audience) return;
    try {
      audience.shutdown();
      log('SHUTDOWN', 'ok', 'ok');
    } catch (err) {
      log('SHUTDOWN', String(err && err.message || err), 'err');
    }
    audience = null;
    currentUserId = null;
    currentConsent = null;
    setInitState(false);
    updateConsentButtons();
    updateStatus();
  }

  function onReset() {
    if (!audience) return;
    try {
      audience.reset();
      currentUserId = null;
      log('RESET', 'ok', 'ok');
    } catch (err) {
      log('RESET', String(err && err.message || err), 'err');
    }
    updateStatus();
  }

  function onFlush() {
    if (!audience) return;
    log('FLUSH', 'flushing\u2026', 'info');
    audience.flush().then(function () {
      log('FLUSH', 'complete', 'ok');
    }).catch(function (err) {
      log('FLUSH', String(err && err.message || err), 'err');
    });
  }

  function onSetConsent(level) {
    if (!audience) return;
    try {
      audience.setConsent(level);
      currentConsent = level;
      log('CONSENT', 'set to ' + level, 'ok');
      if (level === 'none') currentUserId = null;
    } catch (err) {
      log('CONSENT', String(err && err.message || err), 'err');
    }
    updateConsentButtons();
    updateStatus();
  }

  function onPage() {
    if (!audience) return;
    var props = parseJsonOrWarn($('page-props').value, 'page properties');
    if (props === null) return;

    try {
      audience.page(props);
      log('PAGE', props || '(no properties)', 'ok');
    } catch (err) {
      log('PAGE', String(err && err.message || err), 'err');
    }
  }

  function onTrack() {
    if (!audience) return;
    var name = $('track-name').value.trim();
    if (!name) {
      log('WARN', 'Track: event name is required', 'warn');
      return;
    }
    var props = parseJsonOrWarn($('track-props').value, 'track properties');
    if (props === null) return;

    try {
      audience.track(name, props);
      log('TRACK', { eventName: name, properties: props }, 'ok');
    } catch (err) {
      log('TRACK', String(err && err.message || err), 'err');
    }
  }

  function onIdentify() {
    if (!audience) return;
    var id = $('identify-id').value.trim();
    if (!id) {
      log('WARN', 'Identify: ID is required', 'warn');
      return;
    }
    var identityType = $('identify-type').value;
    var traits = parseJsonOrWarn($('identify-traits').value, 'identify traits');
    if (traits === null) return;

    try {
      if (traits !== undefined) {
        audience.identify(id, identityType, traits);
      } else {
        audience.identify(id, identityType);
      }
      currentUserId = id;
      log('IDENTIFY', { id: id, identityType: identityType, traits: traits }, 'ok');
    } catch (err) {
      log('IDENTIFY', String(err && err.message || err), 'err');
    }
    updateStatus();
  }

  function onIdentifyTraits() {
    if (!audience) return;
    var traits = parseJsonOrWarn($('identify-traits').value, 'identify traits');
    if (traits === null || traits === undefined) {
      log('WARN', 'Traits-only identify: traits are required', 'warn');
      return;
    }
    try {
      audience.identify(traits);
      log('IDENTIFY', { traitsOnly: traits }, 'ok');
    } catch (err) {
      log('IDENTIFY', String(err && err.message || err), 'err');
    }
  }

  function onAlias() {
    if (!audience) return;
    var fromId = $('alias-from-id').value.trim();
    var toId = $('alias-to-id').value.trim();
    var fromType = $('alias-from-type').value;
    var toType = $('alias-to-type').value;

    if (!fromId || !toId) {
      log('WARN', 'Alias: both IDs are required', 'warn');
      return;
    }
    if (fromId === toId && fromType === toType) {
      log('WARN', 'Alias: from and to are identical', 'warn');
      return;
    }

    try {
      audience.alias(
        { id: fromId, identityType: fromType },
        { id: toId, identityType: toType },
      );
      log('ALIAS', { from: { id: fromId, type: fromType }, to: { id: toId, type: toType } }, 'ok');
    } catch (err) {
      log('ALIAS', String(err && err.message || err), 'err');
    }
  }

  function updateConsentButtons() {
    var btns = [
      { el: $('btn-consent-none'), level: 'none' },
      { el: $('btn-consent-anon'), level: 'anonymous' },
      { el: $('btn-consent-full'), level: 'full' },
    ];
    for (var i = 0; i < btns.length; i++) {
      btns[i].el.disabled = !audience;
      if (audience && currentConsent === btns[i].level) {
        btns[i].el.classList.add('active');
      } else {
        btns[i].el.classList.remove('active');
      }
    }
  }

  // Wire up
  document.addEventListener('DOMContentLoaded', function () {
    $('btn-init').addEventListener('click', onInit);
    $('btn-shutdown').addEventListener('click', onShutdown);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-flush').addEventListener('click', onFlush);
    $('btn-clear-log').addEventListener('click', clearLog);

    $('btn-consent-none').addEventListener('click', function () { onSetConsent('none'); });
    $('btn-consent-anon').addEventListener('click', function () { onSetConsent('anonymous'); });
    $('btn-consent-full').addEventListener('click', function () { onSetConsent('full'); });

    $('btn-page').addEventListener('click', onPage);
    $('btn-track').addEventListener('click', onTrack);

    populateIdentityDropdowns();
    $('btn-identify').addEventListener('click', onIdentify);
    $('btn-identify-traits').addEventListener('click', onIdentifyTraits);
    $('btn-alias').addEventListener('click', onAlias);

    // Enable Init only when the publishable key input has non-whitespace content.
    $('pk').addEventListener('input', syncInitEnabled);
    syncInitEnabled();

    setInterval(updateStatus, 1000);
    updateStatus();
    log('READY', 'Demo loaded. Paste a publishable key and click Init.', 'info');
  });
})();

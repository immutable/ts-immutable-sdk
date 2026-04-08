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

      var detailStr = typeof e.detail === 'object' ? JSON.stringify(e.detail, null, 2) : String(e.detail);
      var detailEl = create('span', 'log-detail');
      text(detailEl, detailStr);

      entry.appendChild(timeEl);
      entry.appendChild(methodEl);
      entry.appendChild(detailEl);
      container.appendChild(entry);
    }
    container.scrollTop = container.scrollHeight;
    text($('log-count'), logEntries.length + ' entries');
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
    text($('status-consent'), consent);
    $('status-consent').className = 'status-value' + (audience && currentConsent ? '' : ' dim');

    var anonCookie = document.cookie.match(/imtbl_anon_id=([^;]*)/);
    text($('status-anon'), anonCookie ? decodeURIComponent(anonCookie[1]) : '—');
    $('status-anon').className = 'status-value' + (anonCookie ? '' : ' dim');

    text($('status-user'), currentUserId || '—');
    $('status-user').className = 'status-value' + (currentUserId ? '' : ' dim');
  }

  // Enable/disable controls based on init state
  function setInitState(on) {
    $('btn-init').disabled = on;
    $('btn-shutdown').disabled = !on;
    $('btn-reset').disabled = !on;
    $('btn-flush').disabled = !on;
    $('pk').disabled = on;
    var envRadios = document.querySelectorAll('input[name="env"]');
    for (var i = 0; i < envRadios.length; i++) envRadios[i].disabled = on;
    var consentRadios = document.querySelectorAll('input[name="initial-consent"]');
    for (var j = 0; j < consentRadios.length; j++) consentRadios[j].disabled = on;
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
    if (!pk) {
      log('WARN', 'Publishable key is required.', 'warn');
      return;
    }
    var env = getRadio('env');
    var consent = getRadio('initial-consent');
    var debug = $('debug').checked;

    try {
      audience = Audience.init({
        publishableKey: pk,
        environment: env,
        consent: consent,
        debug: debug,
        onError: handleError,
      });
      setInitState(true);
      currentConsent = consent;
      log('INIT', { environment: env, consent: consent, debug: debug }, 'ok');
    } catch (err) {
      log('INIT', String(err && err.message || err), 'err');
      return;
    }
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

  // Wire up
  document.addEventListener('DOMContentLoaded', function () {
    $('btn-init').addEventListener('click', onInit);
    $('btn-shutdown').addEventListener('click', onShutdown);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-flush').addEventListener('click', onFlush);
    $('btn-clear-log').addEventListener('click', clearLog);

    setInterval(updateStatus, 1000);
    updateStatus();
    log('READY', 'Demo loaded. Paste a publishable key and click Init.', 'info');
  });
})();

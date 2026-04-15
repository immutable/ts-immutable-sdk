// Sample app for @imtbl/audience.
//
// Vanilla ES2020, no modules, no imports. Reads window.ImmutableAudience
// that the CDN bundle attaches. CSP-safe: all event wiring via
// addEventListener, all DOM rendering via createElement + textContent.

(function () {
  'use strict';

  if (!window.ImmutableAudience) {
    document.body.innerText = 'ERROR: window.ImmutableAudience is undefined. The CDN bundle did not load.';
    return;
  }

  var Audience = window.ImmutableAudience.Audience;
  var AudienceError = window.ImmutableAudience.AudienceError;
  var IdentityType = window.ImmutableAudience.IdentityType;
  var SDK_VERSION = window.ImmutableAudience.version || 'unknown';

  // Hardcoded event catalogue. AudienceEvents is exported from @imtbl/audience
  // but not attached to window.ImmutableAudience by the CDN bundle, so sample
  // apps that load via <script> tag can't reach it at runtime. These strings
  // are the canonical values from events.ts; see the README for the typed
  // property shape of each one.
  var AUDIENCE_EVENTS = [
    { name: 'sign_up',          fields: [{ key: 'method', type: 'string', optional: true }] },
    { name: 'sign_in',          fields: [{ key: 'method', type: 'string', optional: true }] },
    { name: 'wishlist_add',     fields: [
      { key: 'gameId', type: 'string' },
      { key: 'source', type: 'string', optional: true },
      { key: 'platform', type: 'string', optional: true },
    ] },
    { name: 'wishlist_remove',  fields: [{ key: 'gameId', type: 'string' }] },
    { name: 'purchase',         fields: [
      { key: 'currency', type: 'string' },
      { key: 'value', type: 'number' },
      { key: 'itemId', type: 'string', optional: true },
      { key: 'itemName', type: 'string', optional: true },
      { key: 'quantity', type: 'number', optional: true },
      { key: 'transactionId', type: 'string', optional: true },
    ] },
    { name: 'game_launch',      fields: [
      { key: 'platform', type: 'string', optional: true },
      { key: 'version', type: 'string', optional: true },
      { key: 'buildId', type: 'string', optional: true },
    ] },
    { name: 'progression',      fields: [
      { key: 'status', type: 'enum', values: ['start', 'complete', 'fail'] },
      { key: 'world', type: 'string', optional: true },
      { key: 'level', type: 'string', optional: true },
      { key: 'stage', type: 'string', optional: true },
      { key: 'score', type: 'number', optional: true },
      { key: 'durationSec', type: 'number', optional: true },
    ] },
    { name: 'resource',         fields: [
      { key: 'flow', type: 'enum', values: ['sink', 'source'] },
      { key: 'currency', type: 'string' },
      { key: 'amount', type: 'number' },
      { key: 'itemType', type: 'string', optional: true },
      { key: 'itemId', type: 'string', optional: true },
    ] },
    { name: 'email_acquired',   fields: [{ key: 'source', type: 'string', optional: true }] },
    { name: 'game_page_viewed', fields: [
      { key: 'gameId', type: 'string' },
      { key: 'gameName', type: 'string', optional: true },
      { key: 'slug', type: 'string', optional: true },
    ] },
    { name: 'link_clicked',     fields: [
      { key: 'url', type: 'string' },
      { key: 'label', type: 'string', optional: true },
      { key: 'source', type: 'string', optional: true },
      { key: 'gameId', type: 'string', optional: true },
    ] },
  ];

  // State
  var audience = null;
  var currentConsent = null;
  var logEntries = [];
  var logAutoScroll = true;
  var MAX_LOG_ENTRIES = 500;
  var LOG_BOTTOM_THRESHOLD = 20;

  // DOM helpers
  function $(id) { return document.getElementById(id); }
  function text(el, val) { el.textContent = val; return el; }
  function create(tag, className) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  // --- Event log ---

  function log(label, payload, level) {
    var entry = {
      ts: new Date().toISOString(),
      label: label,
      payload: payload,
      level: level || 'info',
    };
    logEntries.push(entry);
    if (logEntries.length > MAX_LOG_ENTRIES) {
      logEntries.shift();
      var logEl = $('log');
      if (logEl.firstChild) logEl.removeChild(logEl.firstChild);
    }
    renderLogEntry(entry);
  }

  function renderLogEntry(entry) {
    var row = create('div', 'log-row log-' + entry.level);
    var ts = create('span', 'log-ts'); text(ts, entry.ts.slice(11, 23));
    var label = create('span', 'log-label'); text(label, entry.label);
    var body = create('span', 'log-body');
    text(body, typeof entry.payload === 'string'
      ? entry.payload
      : JSON.stringify(entry.payload));
    row.appendChild(ts);
    row.appendChild(label);
    row.appendChild(body);
    $('log').appendChild(row);
    if (logAutoScroll) $('log').scrollTop = $('log').scrollHeight;
  }

  function clearLog() {
    logEntries.length = 0;
    $('log').textContent = '';
  }

  function copyLog() {
    var text = logEntries.map(function (e) {
      return e.ts + ' [' + e.label + '] '
        + (typeof e.payload === 'string' ? e.payload : JSON.stringify(e.payload));
    }).join('\n');
    navigator.clipboard.writeText(text).catch(function () { /* ignore */ });
  }

  // --- Derived endpoint ---

  var TEST_KEY_PREFIX = 'pk_imapik-test';
  var PROD_URL = 'https://api.immutable.com';
  var SANDBOX_URL = 'https://api.sandbox.immutable.com';

  function deriveEndpoint() {
    var override = $('base-url').value.trim();
    if (override) return override;
    var key = $('pk').value.trim();
    if (!key) return '—';
    return key.indexOf(TEST_KEY_PREFIX) === 0 ? SANDBOX_URL : PROD_URL;
  }

  function updateDerivedEndpoint() {
    text($('derived-endpoint'), deriveEndpoint());
  }

  // --- onError handler ---

  function handleError(err) {
    log('onError', {
      name: err && err.name,
      code: err && err.code,
      status: err && err.status,
      endpoint: err && err.endpoint,
      message: err && err.message,
      responseBody: err && err.responseBody,
    }, 'err');
  }

  // --- Config builder ---

  function readConfig() {
    var config = {
      publishableKey: $('pk').value.trim(),
      consent: $('initial-consent').value,
      debug: $('debug').checked,
      onError: handleError,
    };
    var cookieDomain = $('cookie-domain').value.trim();
    if (cookieDomain) config.cookieDomain = cookieDomain;
    var flushInterval = parseInt($('flush-interval').value, 10);
    if (!Number.isNaN(flushInterval)) config.flushInterval = flushInterval;
    var flushSize = parseInt($('flush-size').value, 10);
    if (!Number.isNaN(flushSize)) config.flushSize = flushSize;
    var baseUrl = $('base-url').value.trim();
    if (baseUrl) config.baseUrl = baseUrl;
    return config;
  }

  // --- Init button gating ---

  function syncInitEnabled() {
    $('btn-init').disabled = $('pk').value.trim() === '' || audience !== null;
  }

  function setInitState(on) {
    // Setup
    $('btn-init').disabled = on;
    // Lifecycle
    $('btn-page').disabled = !on;
    $('btn-flush').disabled = !on;
    $('btn-reset').disabled = !on;
    $('btn-shutdown').disabled = !on;
    // Consent
    $('btn-consent-none').disabled = !on;
    $('btn-consent-anon').disabled = !on;
    $('btn-consent-full').disabled = !on;
    // Typed events — custom-event button + generated accordion buttons
    var customBtn = $('btn-custom-event'); if (customBtn) customBtn.disabled = !on;
    var typedButtons = document.querySelectorAll('.typed-event-row button');
    for (var i = 0; i < typedButtons.length; i++) typedButtons[i].disabled = !on;
    // Identity
    $('btn-identify').disabled = !on;
    $('btn-identify-traits').disabled = !on;
    $('btn-alias').disabled = true;
    if (on) syncAliasButton();
    // Errors
    $('btn-force-network').disabled = !on;
    $('btn-force-flush-failed').disabled = !on;
    $('btn-force-consent-failed').disabled = !on;
  }

  function updateStatus() {
    text($('status-endpoint'), deriveEndpoint());
    text($('status-consent'), currentConsent || '—');
    $('status-endpoint').className = 'status-value' + (audience ? '' : ' dim');
    $('status-consent').className = 'status-value' + (audience ? '' : ' dim');
  }

  // --- Setup panel: Init ---

  function onInit() {
    var config;
    try {
      config = readConfig();
    } catch (err) {
      log('INIT', 'Invalid config: ' + (err && err.message || err), 'err');
      return;
    }
    try {
      audience = Audience.init(config);
      setInitState(true);
      currentConsent = config.consent;
      log('INIT', {
        consent: config.consent,
        debug: config.debug,
        cookieDomain: config.cookieDomain,
        flushInterval: config.flushInterval,
        flushSize: config.flushSize,
        baseUrl: config.baseUrl,
        derivedEndpoint: deriveEndpoint(),
      }, 'ok');
    } catch (err) {
      log('INIT', String(err && err.message || err), 'err');
      return;
    }
    updateStatus();
  }

  // --- Footer ---

  function renderFooter() {
    text($('sdk-version'), 'SDK version: ' + SDK_VERSION);
  }

  // --- Bootstrap ---

  function bootstrap() {
    // Populate IdentityType dropdowns
    var identityTypeOptions = Object.keys(IdentityType || {});
    ['id-type', 'alias-from-type', 'alias-to-type'].forEach(function (selectId) {
      var el = $(selectId);
      if (!el) return;
      identityTypeOptions.forEach(function (name) {
        var opt = document.createElement('option');
        opt.value = IdentityType[name];
        opt.textContent = IdentityType[name];
        el.appendChild(opt);
      });
    });

    // Setup panel wiring
    $('pk').addEventListener('input', function () { syncInitEnabled(); updateDerivedEndpoint(); });
    $('base-url').addEventListener('input', updateDerivedEndpoint);
    $('btn-init').addEventListener('click', onInit);
    $('btn-page').addEventListener('click', onPage);
    $('btn-flush').addEventListener('click', onFlush);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-shutdown').addEventListener('click', onShutdown);
    $('btn-consent-none').addEventListener('click', function () { onSetConsent('none'); });
    $('btn-consent-anon').addEventListener('click', function () { onSetConsent('anonymous'); });
    $('btn-consent-full').addEventListener('click', function () { onSetConsent('full'); });
    $('btn-identify').addEventListener('click', onIdentify);
    $('btn-identify-traits').addEventListener('click', onIdentifyTraits);
    $('btn-alias').addEventListener('click', onAlias);
    ['alias-from-id', 'alias-to-id'].forEach(function (id) {
      $(id).addEventListener('input', syncAliasButton);
    });
    ['alias-from-type', 'alias-to-type'].forEach(function (id) {
      $(id).addEventListener('change', syncAliasButton);
    });
    $('btn-init-empty-key').addEventListener('click', onInitEmptyKey);
    $('btn-force-network').addEventListener('click', onForceNetworkError);
    $('btn-force-flush-failed').addEventListener('click', onForceFlushFailed);
    $('btn-force-consent-failed').addEventListener('click', onForceConsentFailed);

    // Log wiring
    $('btn-copy-log').addEventListener('click', copyLog);
    $('btn-clear-log').addEventListener('click', clearLog);
    $('log').addEventListener('scroll', function () {
      var el = $('log');
      logAutoScroll = (el.scrollHeight - el.scrollTop - el.clientHeight) < LOG_BOTTOM_THRESHOLD;
    });

    renderTypedEvents();
    $('btn-custom-event').addEventListener('click', onCustomEvent);
    syncInitEnabled();
    updateDerivedEndpoint();
    renderFooter();
    log('READY', 'Sample app loaded. Paste a publishable key and click Init.', 'info');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // --- Lifecycle panel ---

  function onPage() {
    if (!audience) return;
    try {
      var props = { path: window.location.pathname };
      audience.page(props);
      log('page()', props, 'ok');
    } catch (err) {
      log('page()', String(err && err.message || err), 'err');
    }
  }

  function onFlush() {
    if (!audience) return;
    audience.flush().then(function () {
      log('flush()', 'queue flushed', 'ok');
    }).catch(function (err) {
      log('flush()', String(err && err.message || err), 'err');
    });
  }

  function onReset() {
    if (!audience) return;
    audience.reset();
    log('reset()', 'anonymous ID regenerated, queue cleared', 'ok');
    updateStatus();
  }

  function onShutdown() {
    if (!audience) return;
    audience.shutdown();
    audience = null;
    currentConsent = null;
    setInitState(false);
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
      log('setConsent()', { from: previous, to: level }, 'ok');
      updateStatus();
    } catch (err) {
      log('setConsent()', String(err && err.message || err), 'err');
    }
  }

  // --- Typed Events panel ---

  function renderTypedEvents() {
    var container = $('typed-events-accordion');
    AUDIENCE_EVENTS.forEach(function (event) {
      var row = create('details', 'typed-event-row');
      var summary = create('summary'); text(summary, event.name);
      row.appendChild(summary);

      var inputsByKey = {};
      event.fields.forEach(function (field) {
        var fieldEl = create('div', 'field');
        var label = create('label');
        text(label, field.key + (field.optional ? '?' : '') + ': ' + (field.values ? field.values.join(' | ') : field.type));
        fieldEl.appendChild(label);

        var input;
        if (field.type === 'enum') {
          input = create('select');
          if (field.optional) {
            var blank = document.createElement('option');
            blank.value = '';
            blank.textContent = '(not set)';
            input.appendChild(blank);
          }
          field.values.forEach(function (v) {
            var opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            input.appendChild(opt);
          });
        } else {
          input = create('input');
          input.type = field.type === 'number' ? 'number' : 'text';
        }
        fieldEl.appendChild(input);
        row.appendChild(fieldEl);
        inputsByKey[field.key] = { input: input, field: field };
      });

      var snippet = create('pre', 'ts-snippet');
      row.appendChild(snippet);

      var actions = create('div', 'actions');
      var btn = create('button');
      text(btn, 'Send');
      btn.disabled = true;
      actions.appendChild(btn);
      row.appendChild(actions);

      function collectProps() {
        var props = {};
        Object.keys(inputsByKey).forEach(function (key) {
          var entry = inputsByKey[key];
          var raw = entry.input.value;
          if (raw === '' || raw === null || raw === undefined) return;
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

      function formatSnippet() {
        var props = collectProps();
        var lines = ['audience.track(\'' + event.name + '\', {'];
        Object.keys(props).forEach(function (key) {
          var v = props[key];
          var formatted = typeof v === 'number' ? String(v) : JSON.stringify(v);
          lines.push('  ' + key + ': ' + formatted + ',');
        });
        lines.push('});');
        text(snippet, lines.join('\n'));
      }

      Object.keys(inputsByKey).forEach(function (key) {
        inputsByKey[key].input.addEventListener('input', formatSnippet);
        inputsByKey[key].input.addEventListener('change', formatSnippet);
      });

      btn.addEventListener('click', function () {
        if (!audience) return;
        var props = collectProps();
        try {
          audience.track(event.name, props);
          log('track()', { event: event.name, properties: props }, 'ok');
        } catch (err) {
          log('track()', String(err && err.message || err), 'err');
        }
      });

      formatSnippet();
      container.appendChild(row);
    });
  }

  // Custom event (escape hatch)
  function onCustomEvent() {
    if (!audience) return;
    var name = $('custom-event-name').value.trim();
    if (!name) {
      log('track()', 'event name required', 'err');
      return;
    }
    var propsText = $('custom-event-props').value.trim();
    var props;
    try {
      props = propsText ? JSON.parse(propsText) : undefined;
    } catch (err) {
      log('track()', 'invalid JSON: ' + err.message, 'err');
      return;
    }
    try {
      audience.track(name, props);
      log('track()', { event: name, properties: props }, 'ok');
    } catch (err) {
      log('track()', String(err && err.message || err), 'err');
    }
  }

  // --- Identity panel ---

  function parseTraits(raw) {
    var trimmed = (raw || '').trim();
    if (!trimmed) return undefined;
    return JSON.parse(trimmed);
  }

  function onIdentify() {
    if (!audience) return;
    if (currentConsent !== 'full') {
      log('identify()', 'skipped — requires consent: full (current: ' + currentConsent + ')', 'info');
      return;
    }
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
      log('identify()', { id: id, identityType: type, traits: traits }, 'ok');
    } catch (err) {
      log('identify()', String(err && err.message || err), 'err');
    }
  }

  function onIdentifyTraits() {
    if (!audience) return;
    if (currentConsent !== 'full') {
      log('identify()', 'skipped — requires consent: full (current: ' + currentConsent + ')', 'info');
      return;
    }
    var traits;
    try { traits = parseTraits($('traits-json').value); }
    catch (err) { log('identify()', 'invalid JSON: ' + err.message, 'err'); return; }
    if (!traits) {
      log('identify()', 'traits required', 'err');
      return;
    }
    try {
      audience.identify(traits);
      log('identify(traits)', traits, 'ok');
    } catch (err) {
      log('identify(traits)', String(err && err.message || err), 'err');
    }
  }

  function onAlias() {
    if (!audience) return;
    if (currentConsent !== 'full') {
      log('alias()', 'skipped — requires consent: full (current: ' + currentConsent + ')', 'info');
      return;
    }
    var fromId = $('alias-from-id').value.trim();
    var fromType = $('alias-from-type').value;
    var toId = $('alias-to-id').value.trim();
    var toType = $('alias-to-type').value;
    if (!fromId || !toId || (fromId === toId && fromType === toType)) {
      log('alias()', 'from and to must both be set and differ', 'err');
      return;
    }
    try {
      audience.alias(
        { id: fromId, identityType: fromType },
        { id: toId,   identityType: toType   },
      );
      log('alias()', { from: { id: fromId, identityType: fromType }, to: { id: toId, identityType: toType } }, 'ok');
    } catch (err) {
      log('alias()', String(err && err.message || err), 'err');
    }
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

  // --- Error Handling panel ---

  var DEAD_BASE_URL = 'http://127.0.0.1:1/';
  var forceErrorBusy = false;

  function onInitEmptyKey() {
    try {
      Audience.init({ publishableKey: '' });
      log('Init with empty key', 'unexpected: init did not throw', 'err');
    } catch (err) {
      log('Init with empty key', {
        name: err && err.name,
        message: err && err.message,
        isAudienceError: err instanceof AudienceError,
      }, 'ok');
    }
  }

  function withLiveConfig(overrides) {
    var config = readConfig();
    Object.keys(overrides).forEach(function (k) { config[k] = overrides[k]; });
    return config;
  }

  function reInitWithSetupConfig() {
    forceErrorBusy = false;
    if (audience) {
      audience.shutdown();
      audience = null;
    }
    try {
      audience = Audience.init(readConfig());
      currentConsent = $('initial-consent').value;
      setInitState(true);
      updateStatus();
      log('reinit', 'restored to Setup-panel configuration', 'info');
    } catch (err) {
      currentConsent = null;
      setInitState(false);
      updateStatus();
      log('reinit', String(err && err.message || err), 'err');
    }
  }

  function onForceNetworkError() {
    if (!audience) return;
    if (forceErrorBusy) return;
    forceErrorBusy = true;
    audience.shutdown();
    audience = null;
    try {
      audience = Audience.init(withLiveConfig({
        baseUrl: DEAD_BASE_URL,
        consent: 'anonymous',
      }));
      currentConsent = 'anonymous';
      setInitState(true);
    } catch (err) {
      log('Force NETWORK_ERROR', 'init failed: ' + (err && err.message || err), 'err');
      currentConsent = null;
      setInitState(false);
      updateStatus();
      forceErrorBusy = false;
      return;
    }
    audience.page();
    audience.flush().then(function () {
      setTimeout(reInitWithSetupConfig, 500);
    });
  }

  function onForceFlushFailed() {
    if (!audience) return;
    if (forceErrorBusy) return;
    forceErrorBusy = true;
    audience.shutdown();
    audience = null;
    try {
      audience = Audience.init(withLiveConfig({
        publishableKey: 'pk_imapik-test-revoked-0000000000000000',
        consent: 'anonymous',
      }));
      currentConsent = 'anonymous';
      setInitState(true);
    } catch (err) {
      log('Force FLUSH_FAILED', 'init failed: ' + (err && err.message || err), 'err');
      currentConsent = null;
      setInitState(false);
      updateStatus();
      forceErrorBusy = false;
      return;
    }
    audience.page();
    audience.flush().then(function () {
      setTimeout(reInitWithSetupConfig, 500);
    });
  }

  function onForceConsentFailed() {
    if (!audience) return;
    if (forceErrorBusy) return;
    forceErrorBusy = true;
    audience.shutdown();
    audience = null;
    try {
      audience = Audience.init(withLiveConfig({
        baseUrl: DEAD_BASE_URL,
        consent: 'none',
      }));
      currentConsent = 'none';
      setInitState(true);
    } catch (err) {
      log('Force CONSENT_SYNC_FAILED', 'init failed: ' + (err && err.message || err), 'err');
      currentConsent = null;
      setInitState(false);
      updateStatus();
      forceErrorBusy = false;
      return;
    }
    audience.setConsent('anonymous');
    currentConsent = 'anonymous';
    setTimeout(reInitWithSetupConfig, 500);
  }

}());

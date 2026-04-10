# @imtbl/pixel — Immutable Tracking Pixel

A drop-in JavaScript snippet that captures device signals, page views, and attribution data for Immutable's events pipeline. Zero configuration beyond a publishable key.

## Quick Start

Paste this snippet into your site's `<head>` tag:

```html
<script>
(function(){
var w=window,i="__imtbl";
w[i]=w[i]||[];
w[i].push(["init",{"key":"YOUR_PUBLISHABLE_KEY"}]);
var s=document.createElement("script");s.async=1;
s.src="https://cdn.immutable.com/pixel/v1/imtbl.js";
document.head.appendChild(s);
})();
</script>
```

Replace `YOUR_PUBLISHABLE_KEY` with your project's publishable key.

The script loads asynchronously and does not block page rendering. The default consent level is `none` — the pixel loads but does not collect until consent is explicitly set (see [Consent Modes](#consent-modes)). To start collecting anonymous device signals immediately, add `"consent":"anonymous"` to the init object.

## Consent Modes

The `consent` option controls what the pixel collects. **Default is `none`** (no events fire until consent is set).

| Level | What's collected | Cookies set | Use case |
|-------|-----------------|-------------|----------|
| `none` | Nothing — pixel loads but is inert | None | Before consent banner interaction |
| `anonymous` | Device signals, attribution, page views, form submissions, link clicks (no PII) | `imtbl_anon_id`, `_imtbl_sid` | Anonymous analytics without PII |
| `full` | Everything in `anonymous` + email hash from form submissions | `imtbl_anon_id`, `_imtbl_sid` | After explicit user consent |

### Updating consent at runtime

```javascript
// After cookie banner interaction — upgrade to full
window.__imtbl.push(['consent', 'full']);

// Or downgrade (purges PII from queue)
window.__imtbl.push(['consent', 'none']);
```

## Auto-Tracked Events

All events fire automatically with no instrumentation required.

| Event | When it fires | Key properties |
|-------|--------------|----------------|
| `page` | Every page load | UTMs, click IDs (`gclid`, `fbclid`, `ttclid`, `msclkid`, `dclid`, `li_fat_id`), `referral_code`, `landing_page` |
| `session_start` | New session (no active `_imtbl_sid` cookie) | `sessionId` |
| `session_end` | Page unload (`visibilitychange` / `pagehide`) | `sessionId`, `duration` (seconds) |
| `form_submitted` | HTML form submission | `formAction`, `formId`, `formName`, `fieldNames`. `emailHash` at `full` consent only. |
| `link_clicked` | Outbound link click (external domains only) | `linkUrl`, `linkText`, `elementId`, `outbound: true` |

### Disabling specific auto-capture

```html
<script>
(function(){
var w=window,i="__imtbl";
w[i]=w[i]||[];
w[i].push(["init",{
  "key":"YOUR_KEY",
  "consent":"anonymous",
  "autocapture":{"forms":false,"clicks":true}
}]);
var s=document.createElement("script");s.async=1;
s.src="https://cdn.immutable.com/pixel/v1/imtbl.js";
document.head.appendChild(s);
})();
</script>
```

## Cookies

| Cookie | Lifetime | Purpose |
|--------|----------|---------|
| `imtbl_anon_id` | 2 years | Anonymous device ID (shared with web SDK) |
| `_imtbl_sid` | 30 minutes (rolling) | Session ID — resets on inactivity |

Both cookies are first-party (`SameSite=Lax`, `Secure` on HTTPS).

## Content Security Policy (CSP)

If your site uses a Content-Security-Policy header, add these origins to the relevant directives:

```
script-src ... https://cdn.immutable.com;
connect-src ... https://api.immutable.com;
```

These must be added alongside your existing policy values, not replace them.

For nonce-based CSP, add the nonce to the inline `<script>` tag in the snippet:

```html
<script nonce="YOUR_NONCE">
(function(){
var w=window,i="__imtbl";
w[i]=w[i]||[];
w[i].push(["init",{"key":"YOUR_KEY","consent":"anonymous"}]);
var s=document.createElement("script");s.async=1;
s.src="https://cdn.immutable.com/pixel/v1/imtbl.js";
document.head.appendChild(s);
})();
</script>
```

Note: the nonce covers the inline snippet only. The CDN-loaded script (`imtbl.js`) is covered by the `script-src https://cdn.immutable.com` directive.

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 80+ |

## Game Page Integration

The Game Page uses the pixel with `consent: 'anonymous'` (no PII, device signals only):

```html
<script>
(function(){
var w=window,i="__imtbl";
w[i]=w[i]||[];
w[i].push(["init",{"key":"GAME_PAGE_PUBLISHABLE_KEY","consent":"anonymous"}]);
var s=document.createElement("script");s.async=1;
s.src="https://cdn.immutable.com/pixel/v1/imtbl.js";
document.head.appendChild(s);
})();
</script>
```

### Validation Checklist

After installing on Game Page, verify:

- [ ] Snippet is in `<head>` and does not block rendering (async load confirmed)
- [ ] Page load impact under 50ms (measure with Lighthouse)
- [ ] `PageMessage` events visible in events pipeline with `surface: 'pixel'`
- [ ] Attribution context (UTMs, referrer) correctly captured on campaign-linked visits
- [ ] Session cookie (`_imtbl_sid`) set and rolling on navigation
- [ ] Anonymous ID cookie (`imtbl_anon_id`) set with 2-year expiry
- [ ] No console errors across Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- [ ] CSP (if any) allows `script-src cdn.immutable.com` and `connect-src api.immutable.com`
- [ ] 100% of events pass backend schema validation (check rejected count in API logs)
- [ ] Event volume within expected range — no duplicate events, no runaway listeners
- [ ] Monitor for 24 hours post-deployment before clearing for external rollout

### Browser Compatibility Matrix

| Check | Chrome 80+ | Firefox 78+ | Safari 14+ | Edge 80+ |
|-------|-----------|-------------|------------|---------|
| Pixel loads (no network errors) | | | | |
| `page` event fires (POST 200 in Network tab) | | | | |
| `surface: 'pixel'` in request body | | | | |
| `_imtbl_sid` cookie set (30min expiry) | | | | |
| `imtbl_anon_id` cookie set (2yr expiry) | | | | |
| UTM params captured in properties | | | | |
| `form_submitted` fires on form submit | | | | |
| `link_clicked` fires on outbound click | | | | |
| No console errors | | | | |

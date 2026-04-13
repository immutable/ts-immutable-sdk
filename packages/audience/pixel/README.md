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

Replace `YOUR_PUBLISHABLE_KEY` with your project's publishable key from [Immutable Hub](https://hub.immutable.com/).

The script loads asynchronously and does not block page rendering. The default consent level is `none` — the pixel loads but does not collect until consent is explicitly set (see [Consent Modes](#consent-modes)). To start collecting anonymous device signals immediately, add `"consent":"anonymous"` to the init object.

## Consent Modes

The `consent` option controls what the pixel collects. **Default is `none`** (no events fire until consent is set).

| Level | What's collected | Cookies set | Use case |
|-------|-----------------|-------------|----------|
| `none` | Nothing — pixel loads but is inert | None | Before consent banner interaction |
| `anonymous` | Device signals, attribution, page views, form submissions, link clicks (no PII) | `imtbl_anon_id`, `_imtbl_sid` | Anonymous analytics without PII |
| `full` | Everything in `anonymous` + email hash from form submissions | `imtbl_anon_id`, `_imtbl_sid` | After explicit user consent |

### Automatic consent detection

If your site uses a Consent Management Platform (CMP), the pixel can auto-detect consent state by setting `consentMode` to `'auto'`:

```html
w[i].push(["init",{"key":"YOUR_KEY","consentMode":"auto"}]);
```

The pixel checks for these CMP standards (in priority order):

1. [**Google Consent Mode v2**](https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced) — reads `analytics_storage` and `ad_storage` from `window.dataLayer`
2. [**IAB TCF v2**](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md) — reads purpose consents via `window.__tcfapi`

When `consentMode` is `'auto'`, the pixel starts in `none` and upgrades automatically once a CMP is detected. It also listens for ongoing consent changes (e.g. when a user updates their cookie preferences).

If no CMP is detected after a few seconds, the pixel remains in `none`. You can provide a manual fallback by pushing a `consent` command:

```javascript
// Manual fallback if no CMP is present
window.__imtbl.push(['consent', 'anonymous']);
```

### Updating consent at runtime

If you are not using `consentMode: 'auto'`, you can set consent manually at any time:

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


# @imtbl/attribution

Minimal marketing attribution package for web - replacement for AppsFlyer/Adjust. Zero dependencies, lightweight, and designed for easy migration from existing attribution providers.

## Installation

```bash
npm install @imtbl/attribution
# or
pnpm add @imtbl/attribution
# or
yarn add @imtbl/attribution
```

## Quick Start

```typescript
import { Attribution } from '@imtbl/attribution';

const attribution = new Attribution({
  apiEndpoint: 'https://api.example.com/events',
  apiKey: 'your-api-key',
});

// Get anonymous ID
const anonymousId = attribution.getAnonymousId();

// Track events
attribution.logEvent('purchase', { revenue: 99.99, currency: 'USD' });

// Set user ID
attribution.setUserId('user123');
```

## Features

- **Zero Dependencies** - Pure TypeScript, no external dependencies
- **AppsFlyer/Adjust Compatible API** - Easy migration from existing providers
- **Attribution Tracking** - Automatic parsing of UTM, AppsFlyer, and Adjust parameters
- **Offline Resilience** - Events are automatically queued and retried on network failure
- **Storage Abstraction** - Works with localStorage, cookies, or in-memory storage
- **SSR Compatible** - Works in server-side rendering environments
- **TypeScript** - Full TypeScript support with comprehensive types

## Usage

### Basic Initialization

```typescript
import { Attribution } from '@imtbl/attribution';

const attribution = new Attribution({
  apiEndpoint: 'https://api.example.com/events', // Required - events are sent here
  apiKey: 'your-api-key', // Optional - for authentication
  trackPageViews: true, // Automatically track page views
  parseOnInit: true,    // Parse attribution from URL on init
});
```

**Note:** `apiEndpoint` is required (like AppsFlyer/Adjust always send to their servers). Events are sent immediately, and if the network fails, they're queued for retry automatically.

### Get Anonymous ID

```typescript
// Get anonymous ID (persists across sessions)
const anonymousId = attribution.getAnonymousId();
console.log(anonymousId); // e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

// Reset anonymous ID (generates new one)
const newId = attribution.resetAnonymousId();
```

### Track Events

```typescript
// Simple event
attribution.logEvent('button_click');

// Event with parameters (e.g., revenue)
attribution.logEvent('purchase', {
  revenue: 99.99,
  currency: 'USD',
  product_id: 'prod123',
  category: 'games',
});

// Page view tracking (convenience method - equivalent to logEvent('page_view', {...}))
attribution.trackPageView('homepage');

// Or track page views manually
attribution.logEvent('page_view', { page_name: 'homepage', page_url: window.location.href });
```

### User Identification

```typescript
// Set user ID
attribution.setUserId('user123');

// Get user ID
const userId = attribution.getUserId();

// Set user email
attribution.setUserEmail('user@example.com');

// Get user email
const email = attribution.getUserEmail();
```

### Attribution Data

```typescript
// Parse attribution from current URL
const attributionData = attribution.parseAttribution();

// Get stored attribution data
const stored = attribution.getAttributionData();
console.log(stored);
// {
//   source: 'google',
//   medium: 'cpc',
//   campaign: 'summer_sale',
//   referrer: 'example.com',
//   landingPage: 'https://example.com/?utm_source=google',
//   firstTouchTime: 1234567890,
//   lastTouchTime: 1234567890,
//   custom: { ... }
// }
```

### Event Tracking

Events are sent immediately when `logEvent()` is called (like AppsFlyer/Adjust). If the network request fails, events are automatically queued and retried when connectivity is restored. This happens transparently - you don't need to manage the queue manually.

## Comparison with AppsFlyer and Adjust

### Bundle Size Comparison

| SDK | Minified Size | Gzipped Size | Runtime Dependencies |
|-----|--------------|--------------|---------------------|
| **@imtbl/attribution** | ~8 KB | ~3 KB | **0** |
| **AppsFlyer Web SDK** | ~40-60 KB | ~15-20 KB | ~5-10 dependencies |
| **Adjust Web SDK** | ~30-50 KB | ~12-18 KB | ~5-10 dependencies |

**Note:** Bundle sizes are approximate. `@imtbl/attribution` has zero runtime dependencies, making it significantly smaller and faster to load. Competitor SDKs include dependencies for HTTP clients, URL parsing, storage management, and other utilities.

### Functionality Comparison

| Feature | @imtbl/attribution | AppsFlyer Web SDK | Adjust Web SDK |
|---------|-------------------|-------------------|----------------|
| **Core Attribution** |
| UTM parameter parsing | ✅ | ✅ | ✅ |
| AppsFlyer parameter parsing | ✅ | ✅ | ❌ |
| Adjust parameter parsing | ✅ | ❌ | ✅ |
| Referrer tracking | ✅ | ✅ | ✅ |
| First/last touch attribution | ✅ | ✅ | ✅ |
| **User Identification** |
| Anonymous ID generation | ✅ | ✅ | ✅ |
| User ID management | ✅ | ✅ | ✅ |
| User email tracking | ✅ | ✅ | ✅ |
| **Event Tracking** |
| Custom event tracking | ✅ | ✅ | ✅ |
| Event parameters | ✅ | ✅ | ✅ |
| Event value/revenue | ✅ | ✅ | ✅ |
| Event queueing | ✅ | ✅ | ✅ |
| Batch event sending | ✅ | ✅ | ✅ |
| **Storage** |
| localStorage support | ✅ | ✅ | ✅ |
| Cookie fallback | ✅ | ✅ | ✅ |
| SSR compatibility | ✅ | Limited | Limited |
| **Advanced Features** |
| Deep linking | ❌ | ✅ | ✅ |
| Cross-platform attribution | ❌ | ✅ | ✅ |
| Smart banners | ❌ | ✅ | ❌ |
| Fraud detection | ❌ | ✅ | ✅ |
| GDPR compliance tools | ❌ | ✅ | ✅ |
| Real-time attribution callbacks | ❌ | ✅ | ✅ |
| Server-side event forwarding | ❌ | ✅ | ✅ |

### Features Not Included

The following features from AppsFlyer and Adjust SDKs are **not** included in `@imtbl/attribution`:

1. **Deep Linking** - AppsFlyer and Adjust provide deep linking capabilities to direct users to specific in-app content. This SDK focuses on web attribution only.

2. **Cross-Platform Attribution** - Both providers offer solutions to track user journeys across web and mobile apps. This SDK is web-only.

3. **Smart Banners** - AppsFlyer's SDK includes Smart Banners for web-to-app conversion. Not included in this SDK.

4. **Fraud Detection** - AppsFlyer includes built-in fraud detection mechanisms (SDK spoofing, click injection, etc.). This SDK relies on your backend for fraud prevention.

5. **GDPR Compliance Tools** - Adjust provides built-in GDPR compliance features like "Forget Me" and marketing opt-out. You'll need to implement these on your backend.

6. **Real-time Attribution Callbacks** - Both providers offer real-time attribution callbacks. This SDK queues events and sends them via your API endpoint.

7. **Server-side Event Forwarding** - Both providers offer server-side event forwarding APIs. This SDK focuses on client-side tracking.

**Why these features are excluded:**
- **Minimal bundle size** - Keeping the SDK lightweight and dependency-free
- **Web-only focus** - Mobile SDKs will be separate packages
- **Backend flexibility** - Advanced features like fraud detection and GDPR compliance are better handled server-side
- **Simplicity** - Focus on core attribution tracking that works everywhere

## Migration Guides

### Complete Migration Guide: AppsFlyer Web SDK → @imtbl/attribution

This guide will help you migrate from AppsFlyer Web SDK to `@imtbl/attribution` with minimal code changes.

#### Step 1: Installation

**Before:**
```bash
npm install appsflyer-web-sdk
```

**After:**
```bash
npm install @imtbl/attribution
```

#### Step 2: Initialization

**Before (AppsFlyer):**
```typescript
import { appsFlyer } from 'appsflyer-web-sdk';

appsFlyer.init('your-app-id', {
  devKey: 'your-dev-key',
  isDebug: false,
  useCachedDeepLink: true,
});
```

**After (@imtbl/attribution):**
```typescript
import { Attribution } from '@imtbl/attribution';

const attribution = new Attribution({
  apiEndpoint: 'https://api.example.com/events', // Required - your backend endpoint
  apiKey: 'your-api-key', // Optional: for authentication
  trackPageViews: true, // Automatically track page views
  parseOnInit: true, // Parse attribution from URL on init
});
```

#### Step 3: Get Anonymous ID

**Before (AppsFlyer):**
```typescript
const uid = appsFlyer.getAppsFlyerUID();
console.log(uid); // e.g., "12345678-1234-1234-1234-123456789012"
```

**After (@imtbl/attribution):**
```typescript
const uid = attribution.getAnonymousId();
console.log(uid); // e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Note:** The ID format is different (UUID v4-like), but serves the same purpose.

#### Step 4: Event Tracking

**Before (AppsFlyer):**
```typescript
// Simple event
appsFlyer.logEvent('button_click');

// Event with revenue
appsFlyer.logEvent('purchase', {
  revenue: 99.99,
  currency: 'USD',
  product_id: 'prod123',
});

// Event with custom parameters
appsFlyer.logEvent('level_complete', {
  level: 5,
  score: 1000,
  time_spent: 120,
});
```

**After (@imtbl/attribution):**
```typescript
// Simple event
attribution.logEvent('button_click');

// Event with revenue and parameters (all in properties object)
attribution.logEvent('purchase', {
  revenue: 99.99,
  currency: 'USD',
  product_id: 'prod123',
});

// Event with custom parameters
attribution.logEvent('level_complete', {
  level: 5,
  score: 1000,
  time_spent: 120,
});
```

**Key Differences:**
- All event data (including revenue/value) is passed in a single properties object
- Simpler API - no separate value parameter
- More flexible - any property can be included

#### Step 5: User Identification

**Before (AppsFlyer):**
```typescript
// Set customer user ID
appsFlyer.setCustomerUserId('user123');

// Set user emails
appsFlyer.setUserEmails(['user@example.com'], {
  cryptType: 0, // 0 = none, 1 = SHA256
});

// Set additional user data
appsFlyer.setAdditionalData({
  age: 25,
  country: 'US',
});
```

**After (@imtbl/attribution):**
```typescript
// Set user ID (same as AppsFlyer)
attribution.setUserId('user123');

// Set user email (single email - AppsFlyer supports multiple)
attribution.setUserEmail('user@example.com');

// Additional user data should be passed with events
attribution.logEvent('user_profile_updated', {
  age: 25,
  country: 'US',
});
```

**Note:** Our SDK uses the same user identification model as AppsFlyer (`setUserId`, `setUserEmail`). This is the industry standard approach - separate methods for user ID and email, with additional user data passed via event properties. The main difference is AppsFlyer supports multiple emails with hashing options - for that use case, handle multiple emails in your backend and include them in event properties.

**Why separate `setUserId`/`setUserEmail` methods?**
- Matches AppsFlyer/Adjust APIs for easy migration
- Clear separation of identity vs. event data
- User ID/email are persistent and sent with every event
- Additional user attributes (age, country, etc.) are event-specific and passed with events

#### Step 6: Attribution Data

**Before (AppsFlyer):**
```typescript
// AppsFlyer automatically tracks attribution
// Access via callback or wait for attribution data
appsFlyer.onInstallConversionData((data) => {
  console.log('Attribution:', data);
  // {
  //   media_source: 'google',
  //   campaign: 'summer_sale',
  //   af_status: 'Non-organic',
  //   ...
  // }
});
```

**After (@imtbl/attribution):**
```typescript
// Attribution is automatically parsed on init
// Access stored attribution data
const attributionData = attribution.getAttributionData();
console.log(attributionData);
// {
//   source: 'google',
//   medium: 'cpc',
//   campaign: 'summer_sale',
//   referrer: 'example.com',
//   landingPage: 'https://example.com/?utm_source=google',
//   firstTouchTime: 1234567890,
//   lastTouchTime: 1234567890,
//   custom: { ... }
// }

// Or parse from a specific URL
const data = attribution.parseAttribution('https://example.com/?utm_source=google');
```

#### Step 7: Page View Tracking

**Before (AppsFlyer):**
```typescript
// AppsFlyer automatically tracks page views
// Or manually:
appsFlyer.logEvent('page_view', {
  page_name: 'homepage',
  page_url: window.location.href,
});
```

**After (@imtbl/attribution):**
```typescript
// Enable automatic page view tracking
const attribution = new Attribution({
  trackPageViews: true, // Automatically tracks on init
});

// Or manually track page views
attribution.trackPageView('homepage');
```

#### Step 8: Handling Queued Events

**Before (AppsFlyer):**
```typescript
// AppsFlyer handles event sending automatically
// Events are sent to AppsFlyer servers
```

**After (@imtbl/attribution):**
```typescript
// Events are sent immediately (like AppsFlyer)
attribution.logEvent('purchase', { revenue: 99.99 });

// If network fails, event is automatically queued and retried
// This happens transparently - no manual queue management needed
```

#### Step 9: Deep Linking (Not Supported)

**Before (AppsFlyer):**
```typescript
// AppsFlyer deep linking
appsFlyer.onDeepLinking((deepLink) => {
  console.log('Deep link:', deepLink);
});
```

**After (@imtbl/attribution):**
```typescript
// Deep linking is not supported in this SDK
// Handle deep linking separately in your application
// You can still track deep link events:
attribution.logEvent('deep_link_opened', undefined, {
  deep_link_url: window.location.href,
});
```

#### Step 10: Testing Your Migration

1. **Verify Anonymous ID Generation:**
```typescript
const id = attribution.getAnonymousId();
console.assert(typeof id === 'string' && id.length > 0, 'ID should be generated');
```

2. **Test Event Tracking:**
```typescript
attribution.logEvent('test_event', 100, { test: true });
const events = attribution.getQueuedEvents();
console.assert(events.length > 0, 'Event should be queued');
console.assert(events[0].eventName === 'test_event', 'Event name should match');
```

3. **Test Attribution Parsing:**
```typescript
// Simulate URL with attribution parameters
const testUrl = 'https://example.com/?utm_source=google&utm_campaign=test';
const data = attribution.parseAttribution(testUrl);
console.assert(data.source === 'google', 'Source should be parsed');
console.assert(data.campaign === 'test', 'Campaign should be parsed');
```

#### Migration Checklist

- [ ] Install `@imtbl/attribution`
- [ ] Replace AppsFlyer initialization with Attribution initialization
- [ ] Update all `getAppsFlyerUID()` calls to `getAnonymousId()`
- [ ] Update all `logEvent()` calls (adjust parameter order if needed)
- [ ] Update `setCustomerUserId()` to `setUserId()`
- [ ] Update `setUserEmails()` to `setUserEmail()` (single email)
- [ ] Replace attribution callbacks with `getAttributionData()`
- [ ] Configure API endpoint for event sending
- [ ] Test anonymous ID persistence across sessions
- [ ] Test event tracking and queuing
- [ ] Test attribution parameter parsing
- [ ] Update backend to handle events from new SDK
- [ ] Remove AppsFlyer SDK dependency

#### Common Issues and Solutions

**Issue:** Events not being sent
- **Solution:** `apiEndpoint` is required. Events are sent immediately. If network fails, events are automatically queued and retried when connectivity is restored. Check network connectivity.

**Issue:** Anonymous ID format is different
- **Solution:** The ID format is different but functionally equivalent. If you need to preserve existing IDs, use `setUserId()` with your existing ID.

**Issue:** Missing deep linking functionality
- **Solution:** Handle deep linking separately in your application. Track deep link events using `logEvent()`.

**Issue:** Need to track multiple user emails
- **Solution:** Store multiple emails in your backend. Use `setUserEmail()` for the primary email, and include additional emails in event parameters.

### Migrating from Adjust Web SDK

**Before (Adjust):**
```typescript
import { Adjust } from 'adjust-web-sdk';

Adjust.init({
  appToken: 'your-app-token',
  environment: 'production', // or 'sandbox'
});

const adid = Adjust.getAdid();
Adjust.trackEvent('purchase', { revenue: 99.99 });
Adjust.setUserId('user123');
```

**After (@imtbl/attribution):**
```typescript
import { Attribution } from '@imtbl/attribution';

const attribution = new Attribution({
  apiEndpoint: 'https://api.example.com/events',
  apiKey: 'your-api-key',
});

const adid = attribution.getAnonymousId();
attribution.logEvent('purchase', { revenue: 99.99 });
attribution.setUserId('user123');
```

**Key Differences:**
- Adjust uses `trackEvent()` vs `logEvent()`
- Adjust uses `getAdid()` vs `getAnonymousId()`
- Both use properties objects for event data - API is very similar

## API Reference

### `Attribution`

#### Constructor

```typescript
new Attribution(config?: AttributionConfig)
```

**Config Options:**
- `apiEndpoint: string` - API endpoint for sending events (required - like AppsFlyer/Adjust always send to their servers)
- `apiKey?: string` - API key for authentication (optional)
- `trackPageViews?: boolean` - Automatically track page views (default: `false`)
- `storage?: StorageAdapter` - Custom storage adapter (default: auto-detected)
- `parseOnInit?: boolean` - Parse attribution from URL on init (default: `true`)

#### Methods

- `init(): void` - Initialize the SDK (called automatically in constructor)
- `getAnonymousId(): string` - Get anonymous ID (persists across sessions)
- `resetAnonymousId(): string` - Reset anonymous ID (generates new one)
- `setUserId(userId: string | null): void` - Set user ID
- `getUserId(): string | null` - Get user ID
- `setUserEmail(email: string | null): void` - Set user email
- `getUserEmail(): string | null` - Get user email
- `logEvent(eventName: string, eventParams?: Record<string, string | number | boolean>): void` - Log an event (events sent immediately, queued automatically on failure)
- `trackPageView(pageName?: string): void` - Track page view (convenience method that automatically includes page URL - equivalent to `logEvent('page_view', { page_url: ..., page_name: ... })`)
- `parseAttribution(url?: string): AttributionData` - Parse attribution from URL
- `getAttributionData(): AttributionData | null` - Get stored attribution data
- `getDeepLinkData(): DeepLinkData | null` - Get deep link data from attribution
- `setOptOut(optedOut: boolean): void` - Set opt-out status (GDPR compliance)
- `isOptedOut(): boolean` - Get opt-out status
- `forgetMe(): void` - Clear all user data (GDPR "right to be forgotten")
- `clear(): void` - Clear all stored data (for testing or reset)

### Types

#### `AttributionData`

```typescript
interface AttributionData {
  source?: string;           // Campaign source
  medium?: string;           // Campaign medium
  campaign?: string;         // Campaign name
  term?: string;             // Campaign term (keywords)
  content?: string;          // Campaign content (A/B testing)
  referrer?: string;         // Referrer URL
  landingPage?: string;      // Landing page URL
  firstTouchTime?: number;   // First touch timestamp
  lastTouchTime?: number;    // Last touch timestamp
  custom?: Record<string, string>; // Custom attribution parameters
}
```

#### `EventData`

```typescript
interface EventData {
  eventName: string;
  eventParams?: Record<string, string | number | boolean>;
  timestamp: number;
}
```

#### `DeepLinkData`

```typescript
interface DeepLinkData {
  path?: string;           // Deep link path (e.g., '/product/123')
  value?: string;          // Deep link value (alternative format)
  params?: Record<string, string>; // All deep link parameters
  url?: string;            // Full deep link URL
}
```

## Attribution Parameters

The SDK automatically parses the following URL parameters:

### Standard UTM Parameters
- `utm_source` - Campaign source
- `utm_medium` - Campaign medium
- `utm_campaign` - Campaign name
- `utm_term` - Campaign term (keywords)
- `utm_content` - Campaign content (A/B testing)

### AppsFlyer Parameters
- `af_source` / `pid` - Source
- `af_medium` / `c` - Medium
- `af_campaign` / `af_c` - Campaign
- `af_adset` / `af_adset_id` - Ad set
- `af_ad` / `af_ad_id` - Ad

### Adjust Parameters
- `adjust_source` / `network` - Source
- `adjust_campaign` / `campaign` - Campaign
- `adjust_adgroup` / `adgroup` - Ad group
- `adjust_creative` / `creative` - Creative

## Storage

The SDK uses the best available storage mechanism:

1. **localStorage** (preferred) - Browser localStorage
2. **Cookies** (fallback) - If localStorage is unavailable
3. **Memory** (SSR) - In-memory storage for server-side rendering

You can provide a custom storage adapter:

```typescript
import { Attribution, type StorageAdapter } from '@imtbl/attribution';

const customStorage: StorageAdapter = {
  getItem: (key) => { /* ... */ },
  setItem: (key, value) => { /* ... */ },
  removeItem: (key) => { /* ... */ },
};

const attribution = new Attribution({
  storage: customStorage,
});
```

## Integration with Passport

The attribution package integrates seamlessly with Passport for passing anonymous IDs:

```typescript
import { Attribution } from '@imtbl/attribution';
import { Passport } from '@imtbl/passport';

const attribution = new Attribution();
const passport = new Passport({ clientId: '...' });

// Get anonymous ID and pass to Passport login
const anonymousId = attribution.getAnonymousId();
await passport.login({ anonymousId });
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)


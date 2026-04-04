# @imtbl/audience

Player analytics for game studios on Immutable. Track events, identify players, and link identities across platforms — so you can build a complete picture of every player across web, social, and in-game surfaces.

## Quick Start

```ts
import { Audience, AudienceEvent, IdentityProvider } from '@imtbl/audience';

const audience = new Audience({ publishableKey: 'pk_imx_...', environment: 'sandbox' });

audience.identify(IdentityProvider.Steam, '76561198012345');
audience.track(AudienceEvent.Purchase, { currency: 'USD', value: 9.99 });
```

That's it. Events are batched and sent automatically.

## API

### `new Audience(config)`

| Option | Type | Required | Description |
|---|---|---|---|
| `publishableKey` | `string` | Yes | Publishable API key from [Immutable Hub](https://hub.immutable.com) |
| `environment` | `'dev' \| 'sandbox' \| 'production'` | Yes | Immutable environment |

### `audience.track(event, properties)`

Record a predefined player event. TypeScript enforces correct properties per event.

```ts
audience.track(AudienceEvent.LevelReached, { level: 10, characterClass: 'mage' });
audience.track(AudienceEvent.Spend, { currency: 'GOLD', value: 500, itemName: 'Sword of Fire' });
```

### `audience.identify(provider, uid, traits?)`

Tell us **who** this player is. All subsequent `track()` calls are associated with this user.

```ts
audience.identify(IdentityProvider.Passport, 'abc-123', { email: 'player@example.com' });
audience.identify(IdentityProvider.Steam, '76561198012345');
```

Call `identify()` when the player logs in or you first learn who they are.

### `audience.alias(from, to)`

Link two identities so they are merged into one player profile.

```ts
audience.alias(
  { provider: IdentityProvider.Steam, uid: '76561198012345' },
  { provider: IdentityProvider.Passport, uid: 'abc-123' },
);
```

### `audience.reset()`

Clear the current identity. Call on logout.

---

## Supported Identity Providers

| Provider | Enum | Example uid |
|---|---|---|
| Immutable Passport | `IdentityProvider.Passport` | `'abc-123-uuid'` |
| Steam | `IdentityProvider.Steam` | `'76561198012345'` |
| Epic Games | `IdentityProvider.Epic` | `'epic-account-id'` |
| PlayStation | `IdentityProvider.PlayStation` | `'psn-account-id'` |
| Xbox | `IdentityProvider.Xbox` | `'xbox-user-id'` |
| Nintendo | `IdentityProvider.Nintendo` | `'nintendo-account-id'` |
| Google | `IdentityProvider.Google` | `'google-uid'` |
| Apple | `IdentityProvider.Apple` | `'apple-uid'` |
| Discord | `IdentityProvider.Discord` | `'discord-user-id'` |
| Email | `IdentityProvider.Email` | `'player@example.com'` |
| Custom | `IdentityProvider.Custom` | any string — use when no other provider fits |

---

## Identity: `identify` vs `alias`

| Method | What it does |
|---|---|
| `identify(provider, uid)` | "The current player is **this person**" — call on every login |
| `alias(from, to)` | "These two IDs are **the same person**" — call when you know both |

### Decision tree

```
Player logs in
  │
  ├─ Does your game use Passport login?
  │     │
  │     ├─ YES ─── identify(IdentityProvider.Passport, uid)
  │     │            │
  │     │            └─ Player also has another platform ID (Steam, Epic, etc.)?
  │     │                  │
  │     │                  ├─ YES ─── alias({ provider: Steam, uid }, { provider: Passport, uid })
  │     │                  └─ NO  ─── done
  │     │
  │     └─ NO ──── identify(IdentityProvider.Steam, uid)  // or whichever provider
  │                  └─ done
  │
  └─ Player hasn't logged in yet?
        └─ Just call track() — when identify() is called later,
           prior anonymous activity is attributed to that player.
```

### Example A: Game uses Passport + Steam

```ts
audience.identify(IdentityProvider.Passport, 'abc-123');
audience.track(AudienceEvent.SignIn, { method: 'passport' });

// Player connects Steam in settings
audience.alias(
  { provider: IdentityProvider.Steam, uid: '76561198012345' },
  { provider: IdentityProvider.Passport, uid: 'abc-123' },
);
```

### Example B: Game uses Steam only (no Passport)

```ts
audience.identify(IdentityProvider.Steam, '76561198012345');
audience.track(AudienceEvent.SignIn, { method: 'steam' });

// That's it. No alias() needed.
```

### Example C: Anonymous visitor → known player

```ts
// Before login — events are captured anonymously
audience.track(AudienceEvent.WishlistAdd, { gameId: 'my-game', source: 'twitter' });

// Player signs up
audience.identify(IdentityProvider.Passport, 'abc-123', { email: 'player@example.com' });
audience.track(AudienceEvent.SignUp, { method: 'passport' });
```

### TL;DR

- **Always** call `identify()` on login with the appropriate `IdentityProvider`.
- **Only** call `alias()` if your game knows two IDs for the same player.
- If you only have one ID, you're done.

---

## Predefined Events

### Web / Distribution

| Event | Required Properties | Optional Properties |
|---|---|---|
| `SignUp` | — | `method` |
| `SignIn` | — | `method` |
| `WishlistAdd` | `gameId` | `source` |
| `WishlistRemove` | `gameId` | — |
| `Purchase` | `currency`, `value` | `itemId`, `itemName`, `quantity` |

### In-Game

| Event | Required Properties | Optional Properties |
|---|---|---|
| `SessionStart` | — | `sessionId` |
| `SessionEnd` | — | `sessionId`, `duration` (seconds) |
| `LevelReached` | `level` | `characterClass` |
| `Spend` | `currency`, `value` | `itemId`, `itemName` |
| `TutorialComplete` | — | `stepNumber` |

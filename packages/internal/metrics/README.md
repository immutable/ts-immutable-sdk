# @imtbl/metrics

Best-effort SDK ops telemetry: **which SDK version, which method, optional error code**.

Not user analytics. No identity, stacks, device fingerprints, env, or persistent queues.

## API

```ts
import { configure, track } from '@imtbl/metrics';

configure({ clientId: 'your-passport-client-id' });

track('passport', 'login');
track('passport', 'login', { durationMs: 120 });

try {
  await doWork();
} catch (error) {
  if (error instanceof Error) {
    track('passport', 'login', { error });
  }
  throw error;
}
```

Telemetry disables for the page session after the first failed or retired (204) server response.

Internally, events are mapped to the existing `sdk-analytics` v1 wire format so older and
newer SDK clients share the same backend contract.

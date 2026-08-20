/**
 * Opaque runtime id for auth `rid` query params.
 * Owned by auth so login URLs do not depend on metrics.
 */

const STORAGE_KEY = '__IMX-auth-runtime-id';
const LEGACY_METRICS_RUNTIME_KEY = '__IMX-metrics-runtime';

const generateId = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

const readLegacyMetricsRuntimeId = (): string | undefined => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(LEGACY_METRICS_RUNTIME_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as { rid?: string };
    return typeof parsed.rid === 'string' && parsed.rid.length > 0
      ? parsed.rid
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Returns a stable opaque runtime id for this browser profile.
 * Migrates from the former metrics-owned rid when present.
 */
export const getRuntimeId = (): string => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return generateId();
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const migrated = readLegacyMetricsRuntimeId() ?? generateId();
  window.localStorage.setItem(STORAGE_KEY, migrated);
  return migrated;
};

import { generateRuntimeId } from './runtimeId';
import type { MetricsConfig } from './types';

// WARNING: DO NOT CHANGE THE STRING BELOW. IT GETS REPLACED AT BUILD TIME.
const SDK_VERSION = '__SDK_VERSION__';

type RuntimeState = {
  sdkVersion: string;
  clientId?: string;
  /** Opaque session id required by legacy sdk-analytics v1 wire format. */
  runtimeId: string;
  enabled: boolean;
};

const state: RuntimeState = {
  sdkVersion: SDK_VERSION,
  runtimeId: generateRuntimeId(),
  enabled: true,
};

/**
 * Configure app-level metrics context.
 * Partial updates merge with existing config.
 */
export const configure = (config: MetricsConfig): void => {
  if (config.clientId !== undefined) {
    state.clientId = config.clientId;
  }
};

export const getSdkVersion = (): string => state.sdkVersion;

export const getClientId = (): string | undefined => state.clientId;

export const getRuntimeId = (): string => state.runtimeId;

export const isTelemetryEnabled = (): boolean => state.enabled;

export const disableTelemetry = (): void => {
  state.enabled = false;
};

/** Reset for unit tests only. */
export const resetClientForTests = (): void => {
  state.sdkVersion = SDK_VERSION;
  state.clientId = undefined;
  state.runtimeId = generateRuntimeId();
  state.enabled = true;
};

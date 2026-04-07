// No-op stubs for @imtbl/metrics — the pixel is a self-contained bundle
// and doesn't ship internal telemetry.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const track = (..._args: unknown[]): void => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const trackError = (..._args: unknown[]): void => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const trackDuration = (..._args: unknown[]): void => {};

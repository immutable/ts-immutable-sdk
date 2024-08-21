/**
 * The timeout in milliseconds for the iframe to be initialized.
 */
export const IFRAME_INIT_TIMEOUT_MS = 10000;

/**
 * The permissions to allow on the iframe.
 */
export const IFRAME_ALLOW_PERMISSIONS = `
  accelerometer;
  camera;
  microphone;
  geolocation;
  gyroscope;
  fullscreen;
  autoplay;
  encrypted-media;
  picture-in-picture;
  clipboard-write;
  clipboard-read;
`
  .trim()
  .replace(/\n/g, '');

import { CheckoutWidgetsConfig, SemanticVersion } from './definitions/config';
import { globalPackageVersion, isDevMode } from './lib/env';

/**
 * Validates and builds a version string based on the given SemanticVersion object.
 * If the version is undefined or has an invalid major version, it returns the default checkout version.
 * If the version is all zeros, it also returns the default checkout version.
 * Otherwise, it constructs a validated version string based on the major, minor, patch, and build numbers.
 */
export function validateAndBuildVersion(
  version: SemanticVersion | undefined,
): string {
  const defaultPackageVersion = globalPackageVersion();

  if (version === undefined) return defaultPackageVersion;

  // Pre-production release
  // TODO: https://immutable.atlassian.net/browse/WT-1501
  if (
    version.major === undefined
    || version.minor === undefined
    || version.patch === undefined
    || version.prerelease === undefined
  ) return defaultPackageVersion;

  if (version.major < 0) return defaultPackageVersion;
  if (version.minor < 0) return defaultPackageVersion;
  if (version.patch < 0) return defaultPackageVersion;
  if (version.prerelease !== 'alpha') return defaultPackageVersion;

  if (version.major === 0 && version.minor === 0 && version.patch === 0) return defaultPackageVersion;

  let validatedVersion: string = defaultPackageVersion;

  if (!Number.isNaN(version.major) && version.major >= 0) {
    validatedVersion = version.major.toString();
  }

  if (!Number.isNaN(version.minor)) {
    validatedVersion += `.${version.minor.toString()}`;
  }

  if (!Number.isNaN(version.patch)) {
    validatedVersion += `.${version.patch.toString()}`;
  }

  // TODO: https://immutable.atlassian.net/browse/WT-1501
  // Ensure this is gated by `version.prerelease !== undefined`
  // once we go to prod with checkout.
  validatedVersion += `-${version.prerelease}`;

  if (version.build !== undefined && version.build > 0) {
    validatedVersion += `.${version.build}`;
  }

  return validatedVersion;
}

/**
 * Creates and appends a checkout widget script to the document head.
 * @param {CheckoutWidgetsConfig} [config] - The configuration object for the checkout widget.
 * @returns None
 */
export function CheckoutWidgets(config?: CheckoutWidgetsConfig) {
  if (window === undefined) {
    // eslint-disable-next-line no-console
    console.error('missing window object: please run Checkout client side');
    return;
  }
  if (document === undefined) {
    // eslint-disable-next-line no-console
    console.error('missing document object: please run Checkout client side');
    return;
  }

  const checkoutWidgetJS = document.createElement('script');

  const validVersion = validateAndBuildVersion(config?.version);

  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout.js`;
  if (isDevMode()) cdnUrl = 'http://localhost:3000/lib/js/imtbl-checkout.js';

  checkoutWidgetJS.setAttribute('src', cdnUrl);

  document.head.appendChild(checkoutWidgetJS);
  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

/**
 * Updates the configuration for the checkout widgets by setting the global variable
 * `window.ImtblCheckoutWidgetConfig` to the JSON string representation of the given
 * `config` object.
 * @param {CheckoutWidgetsConfig} config - The new configuration object for the checkout widgets.
 * @returns None
 */
export function UpdateConfig(config: CheckoutWidgetsConfig) {
  if (window === undefined) {
    // eslint-disable-next-line no-console
    console.error('missing document object: please run Checkout client side');
    return;
  }

  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

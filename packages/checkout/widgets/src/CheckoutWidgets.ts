import { CheckoutWidgetsConfig, SemanticVersion } from './definitions/config';

export const DEFAULT_CHECKOUT_VERSION = '0.1.9-alpha';

/**
 * Validates and builds a version string based on the given SemanticVersion object.
 * If the version is undefined or has an invalid major version, it returns the default checkout version.
 * If the version is all zeros, it also returns the default checkout version.
 * Otherwise, it constructs a validated version string based on the major, minor, patch, and build numbers.
 * @param {SemanticVersion | undefined} version - The SemanticVersion object to validate and build.
 * @returns {string} - The validated and built version string.
 */
export function validateAndBuildVersion(version: SemanticVersion | undefined): string {
  if (!version || version?.major === undefined || version.major < 0) return DEFAULT_CHECKOUT_VERSION;
  if (version.major === 0 && version.minor === 0 && version.patch === 0) return DEFAULT_CHECKOUT_VERSION;

  let validatedVersion: string = DEFAULT_CHECKOUT_VERSION;

  if (!Number.isNaN(version.major) && version.major >= 0) {
    validatedVersion = version.major.toString();
  }

  if (version.minor !== undefined && !Number.isNaN(version.minor) && version.minor >= 0) {
    validatedVersion += `.${version.minor.toString()}`;
  }

  if (version.patch !== undefined && !Number.isNaN(version.patch) && version.patch >= 0) {
    if (version.minor === undefined) {
      validatedVersion += `.0.${version.patch.toString()}`;
    } else {
      validatedVersion += `.${version.patch.toString()}`;
    }
  }

  // TODO: at the moment all of the releases that include
  // the checkout widgets script have '-alpha' appended
  // Change this when we go to testnet. ticket WT-1432
  validatedVersion += '-alpha';

  if (version.build !== undefined) {
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
  const checkoutWidgetJS = document.createElement('script');

  const validVersion = validateAndBuildVersion(config?.version);

  if (process.env.CHECKOUT_ENVIRONMENT === 'local') {
    checkoutWidgetJS.setAttribute(
      'src',
      'http://localhost:3000/lib/js/imtbl-checkout.js',
    );
  } else {
    const cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout.js`;
    checkoutWidgetJS.setAttribute(
      'src',
      cdnUrl,
    );
  }

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
  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

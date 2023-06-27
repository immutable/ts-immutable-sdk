import { CheckoutWidgetsConfig, SemanticVersion } from './definitions/config';

export const DEFAULT_CHECKOUT_VERSION = '0.1.9-alpha';

/**
 * Checking for valid version numbers input.
 * 0 is a valid value for major, minor and/or patch
 * The current release process only includes the checkout script in 'alpha' builds
 * so we must append '-alpha' to valid versions in order to load the script properly.
 * This may change in the future depending on the relase process.
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
 * CheckoutWidgets allows to inject the Checkout Widgets into your application.
 * @param {CheckoutWidgetsConfig|undefined} config - Checkout Widget global configurations.
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
 * UpdateConfig allows to update the configuration of an existing Checkout Widgets instance.
 * @param {CheckoutWidgetsConfig} config - new Checkout Widget global configurations.
 */
export function UpdateConfig(config: CheckoutWidgetsConfig) {
  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

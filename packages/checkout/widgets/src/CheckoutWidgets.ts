import { CheckoutWidgetsConfig, SemanticVersion } from './definitions/config';
import { CheckoutWidgetTagNames } from './definitions/types';
import { globalPackageVersion, isDevMode } from './lib/env';

function getWidgetConfig(element: Element): CheckoutWidgetsConfig | null {
  const config = element.getAttribute('widgetconfig');
  if (!config) return null;

  try {
    return JSON.parse(config);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn(`Unable to decode widgetconfig for ${element}: `, err);
  }
  return null;
}

function setWidgetConfig(element: Element, config: CheckoutWidgetsConfig) {
  element.setAttribute('widgetconfig', JSON.stringify(config));
}

function saveConfig(config: CheckoutWidgetsConfig) {
  if (window === undefined) {
    // eslint-disable-next-line no-console
    console.error('missing window object: please run Checkout client side');
    return;
  }

  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

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

  if (version === undefined || version.major === undefined) return defaultPackageVersion;

  if (!Number.isInteger(version.major) || version.major < 0) return defaultPackageVersion;
  if (version.minor !== undefined && version.minor < 0) return defaultPackageVersion;
  if (version.patch !== undefined && version.patch < 0) return defaultPackageVersion;

  if (version.major === 0 && version.minor === undefined) return defaultPackageVersion;
  if (version.major === 0 && version.minor === 0 && version.patch === undefined) return defaultPackageVersion;
  if (version.major === 0 && version.minor === undefined && version.patch === undefined) return defaultPackageVersion;
  if (version.major === 0 && version.minor === 0 && version.patch === 0) return defaultPackageVersion;

  let validatedVersion: string = version.major.toString();

  if (version.minor === undefined) return validatedVersion;

  if (Number.isInteger(version.minor)) {
    validatedVersion += `.${version.minor.toString()}`;
  }

  if (version.patch === undefined) return validatedVersion;

  if (Number.isInteger(version.patch)) {
    validatedVersion += `.${version.patch.toString()}`;
  }

  if (version.prerelease === undefined || version.prerelease !== 'alpha') return validatedVersion;

  if (version.prerelease === 'alpha') {
    validatedVersion += `-${version.prerelease}`;
  }

  if (version.build === undefined) return validatedVersion;

  if (Number.isInteger(version.build) && version.build >= 0) {
    validatedVersion += `.${version.build.toString()}`;
  }

  return validatedVersion;
}

function loadScript(config: CheckoutWidgetsConfig) {
  if (document === undefined) {
    // eslint-disable-next-line no-console
    console.error('missing document object: please run Checkout client side');
    return;
  }

  const validVersion = validateAndBuildVersion(config?.version);

  // Prevent the script to be loaded more than once
  // by checking the presence of the script and its version.
  const initScript = document.querySelector('[data-product="checkout"]');
  if (initScript) {
    // eslint-disable-next-line no-console
    console.warn('checkout script has already been loaded, it can only be loaded once.');
    return;
  }

  const tag = document.createElement('script');

  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout.js`;
  if (isDevMode()) cdnUrl = 'http://localhost:3000/lib/js/imtbl-checkout.js';

  tag.setAttribute('data-product', 'checkout');
  tag.setAttribute('data-version', validVersion);
  tag.setAttribute('src', cdnUrl);

  document.head.appendChild(tag);
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

  loadScript(config || {});

  saveConfig(config || {});
}

/**
 * Updates the configuration for the checkout widgets by setting the global variable
 * `window.ImtblCheckoutWidgetConfig` to the JSON string representation of the given
 * `config` object and update all the Checkout web components configuration.
 * @param {CheckoutWidgetsConfig} config - The new configuration object for the checkout widgets.
 * @returns None
 */
export function UpdateConfig(config: CheckoutWidgetsConfig) {
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

  let globalConfig = {};
  try {
    globalConfig = JSON.parse(window.ImtblCheckoutWidgetConfig);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('Unable to decode window.ImtblCheckoutWidgetConfig: ', err);
  }

  Object.values(CheckoutWidgetTagNames).forEach((elem) => {
    const widgets = document.getElementsByTagName(elem);
    if (!widgets) return;

    // Loop through all the widgets to ensure that the script
    // get the correct local configs for the DOM elements and
    // simply update the global configurations.
    for (const e of widgets) {
      const widgetConf = getWidgetConfig(e) || {};
      setWidgetConfig(e, { ...widgetConf, ...config });
    }
  });

  saveConfig({ ...globalConfig, ...config });
}

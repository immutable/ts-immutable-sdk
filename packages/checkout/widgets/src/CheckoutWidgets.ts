import { Web3Provider } from '@ethersproject/providers';
import { CheckoutWidgetsConfig, SemanticVersion } from './definitions/config';
import { CheckoutWidgetTagNames } from './definitions/types';

const DEFAULT_VERSION = '0.1.8-alpha';

/**
 * Checking for valid version numbers input.
 * 0 is a valid value for major, minor and/or patch
 * The current release process only includes the checkout script in 'alpha' builds
 * so we must append '-alpha' to valid versions in order to load the script properly.
 * This may change in the future depending on the relase process.
 */
export function validateAndBuildVersion(version: SemanticVersion | undefined): string {
  if (!version || version?.major === undefined || version.major < 0) return DEFAULT_VERSION;
  if (version.major === 0 && version.minor === 0 && version.patch === 0) return DEFAULT_VERSION;

  let validatedVersion: string = DEFAULT_VERSION;

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

  // at the moment all of the releases that include
  // the checkout widgets script have '-alpha' appended
  validatedVersion += '-alpha';

  if (version.build !== undefined && parseInt(version.build, 10)) {
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
  // eslint-disable-next-line no-console
  console.log('imtbl-checkout version: ', validVersion);

  if (process.env.ENVIRONMENT === 'local') {
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

/**
 * SetProvider allows to set the provider for an existing Checkout Widgets instance.
 * @param {CheckoutWidgetTagNames} tagName - target Checkout Widget widget.
 * @param {Web3Provider} provider - the provider to connect to the blockchain network.
 */
export function SetProvider(
  tagName: CheckoutWidgetTagNames,
  provider: Web3Provider | null,
) {
  if (!provider) {
    // eslint-disable-next-line no-console
    console.error('no provider parsed');
    return;
  }

  let attempts = 0;
  const maxAttempts = 10;
  let timer: number;

  const attemptToSetProvider = () => {
    try {
      const elements = document.getElementsByTagName(tagName);
      const widget = elements[0] as unknown as ImmutableWebComponent;
      widget.setProvider(provider);
      window.clearInterval(timer);
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        // eslint-disable-next-line no-console
        console.error('failed to set the provider');
      }
    }
  };

  timer = window.setInterval(attemptToSetProvider, 10);
  attemptToSetProvider();
}

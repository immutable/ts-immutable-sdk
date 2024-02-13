import { useLocalBundle } from '../env';
import { SemanticVersion } from './definitions/types';
import { validateAndBuildVersion } from './version';

// Loads the checkout widgets bundle from the CDN and appends the script to the document head
export function loadUnresolvedBundle(
  version?: SemanticVersion,
): { loaded: boolean, element: HTMLScriptElement } {
  if (window === undefined) {
    throw new Error('missing window object: please run Checkout client side');
  }

  if (document === undefined) {
    throw new Error('missing document object: please run Checkout client side');
  }

  const scriptId = 'immutable-checkout-widgets-bundle';
  const validVersion = validateAndBuildVersion(version);

  // Prevent the script to be loaded more than once
  // by checking the presence of the script and its version.
  const initScript = document.getElementById(scriptId) as HTMLScriptElement;
  if (initScript) return { loaded: true, element: initScript };

  const tag = document.createElement('script');

  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets.js`;
  if (useLocalBundle()) cdnUrl = `http://${window.location.host}/lib/js/widgets.js`;

  tag.setAttribute('id', scriptId);
  tag.setAttribute('data-version', validVersion);
  tag.setAttribute('src', cdnUrl);

  document.head.appendChild(tag);

  return { loaded: false, element: tag };
}

// Gets the CDN url for the split checkout widgets bundle
export function getCdnUrl(
  version?: SemanticVersion,
): string {
  const validVersion = validateAndBuildVersion(version);
  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets-esm.js`;
  if (useLocalBundle()) cdnUrl = `http://${window.location.host}/lib/js/index.js`;
  return cdnUrl;
}

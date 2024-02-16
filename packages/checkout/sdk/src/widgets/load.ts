import { useLocalBundle } from '../env';
import { SemanticVersion } from './definitions/types';
import { validateAndBuildVersion } from './version';

// Loads the checkout widgets bundle from the CDN and appends the script to the document head
export function loadUnresolvedBundle(
  tag: HTMLScriptElement,
  scriptId: string,
  validVersion: string,
) {
  if (window === undefined) {
    throw new Error('missing window object: please run Checkout client side');
  }

  if (document === undefined) {
    throw new Error('missing document object: please run Checkout client side');
  }

  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets.js`;
  if (useLocalBundle()) cdnUrl = `http://${window.location.host}/lib/js/widgets.js`;

  tag.setAttribute('id', scriptId);
  tag.setAttribute('data-version', validVersion);
  tag.setAttribute('src', cdnUrl);

  document.head.appendChild(tag);
}

// Gets the CDN url for the split checkout widgets bundle
export function getWidgetsEsmUrl(
  version?: SemanticVersion,
): string {
  const validVersion = validateAndBuildVersion(version);
  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets-esm.js`;
  if (useLocalBundle()) cdnUrl = `http://${window.location.host}/lib/js/index.js`;
  return cdnUrl;
}

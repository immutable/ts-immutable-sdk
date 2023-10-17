import { isDevMode } from '../lib/env';
import { SemanticVersion } from './definitions/types';
import { validateAndBuildVersion } from './version';

export function loadUnresolved(
  version?: SemanticVersion,
): { loaded: boolean, element: HTMLScriptElement } {
  if (window === undefined) {
    throw new Error('missing window object: please run Checkout client side');
  }

  if (document === undefined) {
    throw new Error('missing document object: please run Checkout client side');
  }

  const validVersion = validateAndBuildVersion(version);

  // Prevent the script to be loaded more than once
  // by checking the presence of the script and its version.
  const initScript = document.querySelector('[data-product="checkout"]') as HTMLScriptElement;
  if (initScript) return { loaded: true, element: initScript };

  const tag = document.createElement('script');

  let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout.js`;
  if (isDevMode()) cdnUrl = `http://${window.location.host}/lib/js/widgets.js`;

  tag.setAttribute('data-product', 'checkout');
  tag.setAttribute('data-version', validVersion);
  tag.setAttribute('src', cdnUrl);

  document.head.appendChild(tag);

  return { loaded: false, element: tag };
}

/**
 * Creates and appends a checkout widget script to the document head.
 * @param version - The desired widgets bundle version.
 */
export const load = (version?: SemanticVersion): Promise<void> => new Promise((resolve, reject) => {
  try {
    const script = loadUnresolved(version);
    console.log(script);
    if (script.loaded) {
      resolve();
    } else {
      script.element.onload = () => resolve();
    }
  } catch (err) {
    reject(err);
  }
});

// import { useLocalBundle } from '../env';
import { SemanticVersion } from './definitions/types';
import { validateAndBuildVersion } from './version';

export function loadUnresolved(
  version?: SemanticVersion,
): { loaded: boolean, cdnUrl: string } {
  if (window === undefined) {
    throw new Error('missing window object: please run Checkout client side');
  }

  if (document === undefined) {
    throw new Error('missing document object: please run Checkout client side');
  }

  // const scriptId = 'immutable-checkout-widgets-bundle';
  const validVersion = validateAndBuildVersion(version);

  // Prevent the script to be loaded more than once
  // by checking the presence of the script and its version.
  // const initScript = document.getElementById(scriptId) as HTMLScriptElement;
  // if (initScript) return { loaded: true, element: initScript };

  // const tag = document.createElement('script');

  const cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets.js`;
  // if (useLocalBundle()) cdnUrl = `http://${window.location.host}/lib/js/widgets.js`;

  // tag.setAttribute('id', scriptId);
  // tag.setAttribute('data-version', validVersion);
  // tag.setAttribute('type', 'module');
  // tag.setAttribute('src', cdnUrl);

  // document.head.appendChild(tag);

  return { loaded: false, cdnUrl };
}

import { useLocalBundle } from '../env';
import { generateSHA512Hash } from './generateHashes';

// Loads the checkout widgets bundle from the CDN and appends the script to the document head
export async function loadUnresolvedBundle(
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

  if (!useLocalBundle()) {
    const integrityHash = await generateSHA512Hash(cdnUrl);
    tag.setAttribute('integrity', integrityHash);
  }

  tag.setAttribute('id', scriptId);
  tag.setAttribute('data-version', validVersion);
  tag.setAttribute('src', cdnUrl);

  document.head.appendChild(tag);
}

// Gets the CDN url for the split checkout widgets bundle
export async function getWidgetsEsmUrl(
  validVersion: string,
): Promise<Promise<string>> {
  if (useLocalBundle()) return `http://${window.location.host}/lib/js/index.js`;

  const cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets-esm.js`;
  // eslint-disable-next-line max-len
  const validHashesUrl = `https://raw.githubusercontent.com/immutable/ts-immutable-sdk/refs/tags/${validVersion}/packages/checkout/widgets-lib/hashes.json`;

  const hash = await generateSHA512Hash(cdnUrl);

  const widgetsEsmHash: string = await fetch(validHashesUrl)
    .then((response) => response.json())
    .then((hashes) => hashes['dist/index.js'])
    .catch(() => {
      throw new Error('Security Error: could not fetch widgets-esm.js hash');
    });

  if (hash !== widgetsEsmHash) {
    throw new Error('Security Error: widgets-esm.js hash mismatch');
  }

  return cdnUrl;
}

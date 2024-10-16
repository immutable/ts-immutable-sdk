import { useLocalBundle } from '../env';

async function generateSHA512Hash(url: string): Promise<string> {
  // Fetch the content of the remote JavaScript file
  const response = await fetch(url);
  const content = await response.text();

  // Convert the content to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Use the Browser WebCrypto SubtleCrypto API to generate a SHA-512 hash
  const hashBuffer = await window.crypto.subtle.digest('SHA-512', data);

  // Convert the hash to a Base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return `sha512-${hashBase64}`;
}

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
export function getWidgetsEsmUrl(
  validVersion: string,
): string {
  if (useLocalBundle()) return `http://${window.location.host}/lib/js/index.js`;

  const cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets-esm.js`;
  // eslint-disable-next-line max-len
  const validHashesUrl = `https://raw.githubusercontent.com/immutable/ts-immutable-sdk/refs/tags/${validVersion}/packages/checkout/widgets-lib/hashes.json`;

  generateSHA512Hash(cdnUrl)
    .then(async (hash) => {
      const widgetsEsmHash = await fetch(validHashesUrl)
        .then((response) => response.json())
        .then((hashes) => hashes['dist/index.js']) as string;

      if (hash !== widgetsEsmHash) {
        throw new Error('Security Error: widgets-esm.js hash mismatch');
      }
    });

  return `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout/widgets-esm.js`;
}

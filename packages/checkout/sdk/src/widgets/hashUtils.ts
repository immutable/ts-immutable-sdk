/* eslint-disable max-len */
export async function generateSHA512Hash(url: string): Promise<string> {
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

async function getLatestGitTag(): Promise<string> {
  const response = await fetch('https://api.github.com/repos/immutable/ts-immutable-sdk/tags');
  const tags = await response.json();
  return tags[0].name;
}

export async function validatedHashesUrl(version: string): Promise<string> {
  if (version !== 'latest') {
    return `https://raw.githubusercontent.com/immutable/ts-immutable-sdk/refs/tags/${version}/packages/checkout/widgets-lib/hashes.json`;
  }

  const latestGitTag = await getLatestGitTag();
  return `https://raw.githubusercontent.com/immutable/ts-immutable-sdk/refs/tags/${latestGitTag}/packages/checkout/widgets-lib/hashes.json`;
}

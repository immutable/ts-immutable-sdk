const IMTBL_API = 'https://api.immutable.com';

const encodeBase64 = (payload: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(payload, 'utf-8').toString('base64');
  }
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(payload)));
  }
  throw new Error('Base64 encoding not supported in this environment');
};

export async function post<T = unknown>(path: string, data: unknown): Promise<T> {
  const payload = JSON.stringify(data);
  const body = {
    payload: encodeBase64(payload),
  };

  const response = await fetch(`${IMTBL_API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

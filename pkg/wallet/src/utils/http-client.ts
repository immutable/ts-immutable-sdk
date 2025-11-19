/**
 * Minimal HTTP client utility
 * Consolidates fetch patterns across API clients
 */

export interface AuthenticatedFetchOptions {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
}

/**
 * Makes an authenticated HTTP request
 */
export async function authenticatedFetch<T = unknown>(
  url: string,
  options: AuthenticatedFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Makes a JSON-RPC request (for relayer)
 */
export async function jsonRpcRequest<T = unknown>(
  url: string,
  method: string,
  params: unknown[] = [],
  token?: string,
): Promise<T> {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };

  const response = await authenticatedFetch<{ result?: T; error?: { message: string; code?: number } }>(
    url,
    {
      method: 'POST',
      body,
      token,
    },
  );

  if (response.error) {
    throw new Error(`RPC error: ${response.error.message} (code: ${response.error.code || 'unknown'})`);
  }

  return response.result as T;
}

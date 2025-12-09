const CHECK_PATH = '/v1/sdk/session-activity/check';

let baseUrl: string | undefined;

export const setupClient = (sessionActivityApiUrl: string) => {
  if (baseUrl) {
    return;
  }

  baseUrl = sessionActivityApiUrl;
};

type CheckParams = {
  clientId: string;
  wallet?: string;
  checkCount?: number;
  sendCount?: number;
};
export type CheckResponse = {
  contractAddress?: string;
  functionName?: string;
  delay?: number;
};

const buildQueryUrl = (queries: CheckParams): string => {
  const url = new URL(CHECK_PATH, baseUrl);
  Object.entries(queries).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    url.searchParams.append(key, String(value));
  });
  return url.toString();
};

export async function get(queries: CheckParams) {
  if (!baseUrl) {
    throw new Error('Client not initialised');
  }

  const response = await fetch(buildQueryUrl(queries));
  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Session activity request failed with status ${response.status}`);
  }

  return response.json() as Promise<CheckResponse>;
}

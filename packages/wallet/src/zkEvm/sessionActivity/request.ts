import axios, { AxiosInstance } from 'axios';

const CHECK_PATH = '/v1/sdk/session-activity/check';

let client: AxiosInstance | undefined;

export const setupClient = (sessionActivityApiUrl: string) => {
  if (client) {
    return;
  }

  client = axios.create({
    baseURL: sessionActivityApiUrl,
  });
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

export async function get(queries: CheckParams) {
  if (!client) {
    throw new Error('Client not initialised');
  }
  // pass queries as query string
  return client!
    .get<CheckResponse>(CHECK_PATH, {
    params: queries,
  })
    .then((res) => res.data)
    .catch((error) => {
      if (error.response.status === 404) {
        return undefined;
      }
      throw error;
    });
}

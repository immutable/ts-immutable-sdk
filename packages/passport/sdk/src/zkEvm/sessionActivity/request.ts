import { Environment } from '@imtbl/config';
import axios, { AxiosInstance } from 'axios';

// For session activity checks, always use production
// even for sandbox.

const PROD_API = 'https://api.immutable.com';
const SANDBOX_API = 'https://api.sandbox.immutable.com';
const CHECK_PATH = '/v1/sdk/session-activity/check';

const getBaseUrl = (environment?: Environment) => {
  switch (environment) {
    case Environment.SANDBOX:
      return SANDBOX_API;
    case Environment.PRODUCTION:
      return PROD_API;
    default:
      throw new Error('Environment not supported');
  }
};

let client: AxiosInstance | undefined;

export const setupClient = (environment: Environment) => {
  if (client) {
    return;
  }

  client = axios.create({
    baseURL: getBaseUrl(environment),
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

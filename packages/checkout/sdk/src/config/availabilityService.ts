import { Environment } from '@imtbl/config';
import axios from 'axios';
import { ENV_DEVELOPMENT } from '../types';

export const availabilityService = (
  isDevelopment: boolean,
  isProduction: boolean,
) => {
  const IMMUTABLE_API_BASE_URL = {
    [ENV_DEVELOPMENT]: 'https://api.dev.immutable.com',
    [Environment.SANDBOX]: 'https://api.sandbox.immutable.com',
    [Environment.PRODUCTION]: 'https://api.immutable.com',
  };

  const postEndpoint = () => {
    if (isDevelopment) return IMMUTABLE_API_BASE_URL[ENV_DEVELOPMENT];
    if (isProduction) return IMMUTABLE_API_BASE_URL[Environment.PRODUCTION];
    return IMMUTABLE_API_BASE_URL[Environment.SANDBOX];
  };

  const checkDexAvailability = async (): Promise<boolean> => {
    let availability;
    try {
      const response = await axios.post(`${postEndpoint()}/v1/availability/dex`);
      if (response.status === 403) {
        availability = false;
      }
      if (response.status === 204) {
        availability = true;
      } else {
        throw new Error(`Status code: ${response.status}`);
      }
    } catch (error:any) {
      throw new Error(`Error fetching from api: ${error.message}`);
    }
    return availability;
  };

  const checkOnRampAvailability = async () => {
    // onramp logic
  };

  return {
    checkDexAvailability,
    checkOnRampAvailability,
  };
};

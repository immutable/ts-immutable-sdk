import { Environment } from '@imtbl/config';
import axios from 'axios';
import { ENV_DEVELOPMENT, IMMUTABLE_API_BASE_URL } from '../types';

export type AvailabilityService = {
  checkDexAvailability: () => Promise<boolean>
};

export const availabilityService = (
  isDevelopment: boolean,
  isProduction: boolean,
) => {
  const postEndpoint = () => {
    if (isDevelopment) return IMMUTABLE_API_BASE_URL[ENV_DEVELOPMENT];
    if (isProduction) return IMMUTABLE_API_BASE_URL[Environment.PRODUCTION];

    return IMMUTABLE_API_BASE_URL[Environment.SANDBOX];
  };

  const checkDexAvailability = async (): Promise<boolean> => {
    try {
      const response = await axios.post(`${postEndpoint()}/v1/availability/checkout/swap`);
      if (response.status === 403) {
        return false;
      }
      if (response.status === 204) {
        return true;
      }
      throw new Error(`Error fetching from api: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      throw new Error(`Error fetching from api: ${error.message}`);
    }
  };

  return {
    checkDexAvailability,
  };
};

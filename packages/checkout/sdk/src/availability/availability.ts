import { Environment } from '@imtbl/config';
import axios from 'axios';
import { ENV_DEVELOPMENT, IMMUTABLE_API_BASE_URL } from '../types';

type AvailabilityService = (
  isDevelopment: boolean,
  isProduction: boolean
) => {
  checkDexAvailability: () => Promise<boolean>
};

export const availabilityService: AvailabilityService = (
  isDevelopment: boolean,
  isProduction: boolean,
) => {
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
      } else if (response.status === 204) {
        availability = true;
      } else {
        throw new Error(`Error fetching from api: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      throw new Error(`Error fetching from api: ${error.message}`);
    }
    return availability;
  };

  return {
    checkDexAvailability,
  };
};

import axios from 'axios';
import { CheckoutError, CheckoutErrorType } from '../errors';

export type AvailabilityService = {
  checkDexAvailability: () => Promise<boolean>
};

export const availabilityService = (
  postEndpoint: string,
) => {
  const checkDexAvailability = async (): Promise<boolean> => {
    let response;

    try {
      response = await axios.post(`${postEndpoint}/v1/availability/checkout/swap`);
    } catch (err: any) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      response = err.response;

      // If 403 then the service is geo-blocked
      if (response.status === 403) return false;

      throw new CheckoutError(
        `Error fetching from api: ${response.status} ${response.statusText}`,
        CheckoutErrorType.API_ERROR,
        { error: err },
      );
    }

    return true;
  };

  return {
    checkDexAvailability,
  };
};

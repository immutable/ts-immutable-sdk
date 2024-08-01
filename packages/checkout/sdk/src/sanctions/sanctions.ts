import axios from 'axios';
import { Environment } from '@imtbl/config';
import { CHECKOUT_CDN_BASE_URL } from '../env';

export const isAddressSanctioned = async (
  address: string,
  environment: Environment,
): Promise<boolean> => {
  let isSanctioned = false;
  try {
    const response = await axios.get(
      `${CHECKOUT_CDN_BASE_URL[environment]}/v1/address/check/${address}`,
    );

    if (response.data.identifications.length > 0) {
      isSanctioned = true;
    }
  } catch (error) {
    return false;
  }

  return isSanctioned;
};

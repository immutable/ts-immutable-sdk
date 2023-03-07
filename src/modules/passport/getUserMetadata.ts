import axios from 'axios';
import { PassportMetadata } from './types';

export const getUserEtherKeyFromMetadata = async (authDomain: string, jwt: string): Promise<string> => {
  const passportData = await getUserPassportMetadata(authDomain, jwt);
  const metadataExists = !!passportData?.ether_key && !!passportData?.stark_key && !!passportData?.user_admin_key;
  if (metadataExists) {
    return passportData.ether_key;
  }
  return Promise.reject('user wallet addresses not exist');
};

export const getUserPassportMetadata = async (authDomain: string, jwt: string): Promise<PassportMetadata> => {
  const { data } = await axios.get(`${authDomain}/userinfo`, {
    headers: {
      Authorization: `Bearer ` + jwt
    }
  });
  return data?.passport;
};

import axios from 'axios';
import { PassportMetadata } from './types';

export const getUserEtherKeyFromMetadata = async (authDomain: string, jwt: string): Promise<string> => {
  const passportData = await getUserPassportMetadata(authDomain, jwt);
  console.log('passportData', passportData)
  const metadataExists = !!passportData?.ether_key && !!passportData?.stark_key && !!passportData?.user_admin_key;
  if (metadataExists) {
    console.log('passportData.ether_key', passportData.ether_key)
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
  console.log('data', data)
  return data?.passport;
};

import axios from 'axios';

export const getEtherKeyFromUserMetadata = async (authDomain: string, jwt: string): Promise<string> => {
  const { data } = await axios.get(`${authDomain}/userinfo`, {
    headers: {
      Authorization: `Bearer ` + jwt
    }
  });
  const metadataExists = !!data?.passport?.ether_key && !!data?.passport?.stark_key && !!data?.passport?.user_admin_key;
  if (metadataExists) {
    return data.passport.ether_key;
  }
  return Promise.reject('user wallet addresses not exist');
};

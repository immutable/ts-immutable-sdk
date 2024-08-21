// #doc passport-react-login-without-wallet
import { reactPassport, passport } from '@imtbl/sdk';
import { useState } from 'react';

export default function Page() {
  const { login, getProfile } = reactPassport.usePassport();
  const [profile, setProfile] = useState<passport.UserProfile | undefined>(undefined);

  return (
    <>
      user profile:
      {' '}
      {profile}
      <button onClick={() => login({ withoutWallet: true })}>Login Without Wallet</button>
      <button onClick={() => getProfile().then(setProfile)}>Get User Profile</button>
    </>
  );
}
// #enddoc passport-react-login-without-wallet

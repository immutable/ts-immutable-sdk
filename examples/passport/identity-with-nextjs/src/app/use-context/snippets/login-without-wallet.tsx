// #doc passport-react-login-without-wallet
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { login } = passport.usePassport();
  const { profile } = passport.useProfile();

  return (
    <>
      userInfo:
      {' '}
      {profile}
      <button onClick={() => login({ withoutWallet: true })}>Login Without Wallet</button>
    </>
  );
}
// #enddoc passport-react-login-without-wallet

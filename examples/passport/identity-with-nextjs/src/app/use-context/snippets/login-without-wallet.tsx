// #doc passport-react-login-without-wallet
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { loginWithoutWallet } = passport.usePassport();
  const { userInfo } = passport.useUserInfo();

  return (
    <>
      userInfo:
      {' '}
      {userInfo}
      <button onClick={loginWithoutWallet}>Login Without Wallet</button>
    </>
  );
}
// #enddoc passport-react-login-without-wallet

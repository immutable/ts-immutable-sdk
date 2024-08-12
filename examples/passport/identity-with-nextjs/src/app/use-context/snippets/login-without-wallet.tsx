// #doc passport-react-login-without-wallet
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { login } = passport.usePassport();
  const { userInfo } = passport.useUserInfo();

  return (
    <>
      userInfo:
      {' '}
      {userInfo}
      <button onClick={() => login(true)}>Login Without Wallet</button>
    </>
  );
}
// #enddoc passport-react-login-without-wallet

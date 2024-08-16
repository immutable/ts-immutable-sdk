// #doc passport-react-login-without-wallet
import { reactPassport } from '@imtbl/sdk';

export default function Page() {
  const { login, profile } = reactPassport.usePassport();

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

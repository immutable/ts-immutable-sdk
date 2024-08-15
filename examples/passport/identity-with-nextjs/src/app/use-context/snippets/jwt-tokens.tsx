// #doc passport-react-jwt-tokens
import { reactPassport } from '@imtbl/sdk';

export default function Page() {
  const { login } = reactPassport.usePassport();
  const { idToken } = reactPassport.useIdToken();
  const { accessToken } = reactPassport.useAccessToken();

  return (
    <>
      Access Token:
      {' '}
      {accessToken}
      ID Token:
      {' '}
      {idToken}
      <button onClick={() => login()}>Login</button>
    </>
  );
}
// #enddoc passport-react-jwt-tokens

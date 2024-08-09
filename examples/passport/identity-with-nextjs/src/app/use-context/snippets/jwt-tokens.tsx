// #doc passport-react-jwt-tokens
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { login } = passport.usePassport();
  const { idToken } = passport.useIdToken();
  const { accessToken } = passport.useAccessToken();

  return (
    <>
      Access Token:
      {' '}
      {accessToken}
      ID Token:
      {' '}
      {idToken}
      <button onClick={login}>Login</button>
    </>
  );
}
// #enddoc passport-react-jwt-tokens

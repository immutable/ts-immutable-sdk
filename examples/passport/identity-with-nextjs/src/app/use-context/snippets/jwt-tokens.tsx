// #doc passport-react-jwt-tokens
import { reactPassport } from '@imtbl/sdk';
import { useState } from 'react';

export default function Page() {
  const { login, getAccessToken, getIdToken } = reactPassport.usePassport();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [idToken, setIdToken] = useState<string | undefined>();

  return (
    <>
      Access Token:
      {' '}
      {accessToken}
      ID Token:
      {' '}
      {idToken}
      <button onClick={() => login()}>Login</button>
      <button onClick={() => {
        getAccessToken().then(setAccessToken);
        getIdToken().then(setIdToken);
      }}>Get Tokens</button>
    </>
  );
}
// #enddoc passport-react-jwt-tokens

// #doc passport-react-jwt-tokens
import { reactPassport } from '@imtbl/sdk';
import { useState } from 'react';

export default function Page() {
  const { login, accessToken, idToken } = reactPassport.usePassport();

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

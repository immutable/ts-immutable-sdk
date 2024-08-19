// #doc passport-react-login
import { reactPassport } from '@imtbl/sdk';
import { useState } from 'react';

export default function MyComponent() {
  const { login, getAccounts } = reactPassport.usePassport();

  return (
    <>
      <button onClick={() => login()}>Login</button>
      <button onClick={() => getAccounts().then((accounts) => console.log(accounts))}>Get Accounts</button>
    </>
  );
}
// #enddoc passport-react-login

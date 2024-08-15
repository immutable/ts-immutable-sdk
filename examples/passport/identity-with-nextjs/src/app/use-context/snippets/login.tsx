// #doc passport-react-login
import { reactPassport } from '@imtbl/sdk';

export default function MyComponent() {
  const { login } = reactPassport.usePassport();
  const { accounts } = reactPassport.useAccounts();

  return (
    <>
      accounts:
      {' '}
      {accounts}
      <button onClick={() => login()}>Login</button>
    </>
  );
}
// #enddoc passport-react-login

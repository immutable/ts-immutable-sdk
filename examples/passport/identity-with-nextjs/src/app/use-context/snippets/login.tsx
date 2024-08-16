// #doc passport-react-login
import { reactPassport } from '@imtbl/sdk';

export default function MyComponent() {
  const { login, accounts } = reactPassport.usePassport();

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

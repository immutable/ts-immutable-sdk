// #doc passport-react-login
import { passport } from '@imtbl/sdk';

export default function MyComponent() {
  const { login } = passport.usePassport();
  const { accounts } = passport.useAccounts();

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

// #doc passport-react-logout
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { logout } = passport.usePassport();

  return (
    <button onClick={logout}>Logout</button>
  );
}
// #enddoc passport-react-logout

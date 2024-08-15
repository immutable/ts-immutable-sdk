// #doc passport-react-logout
import { reactPassport } from '@imtbl/sdk';

export default function Page() {
  const { logout } = reactPassport.usePassport();

  return (
    <button onClick={logout}>Logout</button>
  );
}
// #enddoc passport-react-logout

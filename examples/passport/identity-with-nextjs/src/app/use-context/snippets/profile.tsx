// #doc passport-react-profile
import { reactPassport } from '@imtbl/sdk';

export default function Page() {
  const { login, profile } = reactPassport.usePassport();

  return (
    <>
      profile:
      {profile}
      <button onClick={() => login()}>Login</button>
    </>
  );
}
// #enddoc passport-react-profile

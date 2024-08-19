// #doc passport-react-profile
import { reactPassport } from '@imtbl/sdk';

export default function Page() {
  const { profile } = reactPassport.useProfile();

  return (
    <>
      userInfo:
      {profile}
    </>
  );
}
// #enddoc passport-react-profile

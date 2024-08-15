// #doc passport-react-profile
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { profile } = passport.useProfile();

  return (
    <>
      userInfo:
      {profile}
    </>
  );
}
// #enddoc passport-react-profile

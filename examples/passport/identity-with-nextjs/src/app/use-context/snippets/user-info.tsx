// #doc passport-react-user-info
import { passport } from '@imtbl/sdk';

export default function Page() {
  const { userInfo } = passport.useUserInfo();

  return (
    <>
      userInfo:
      {userInfo}
    </>
  );
}
// #enddoc passport-react-user-info

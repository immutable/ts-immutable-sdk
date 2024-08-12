'use client';

import { passport } from '@imtbl/sdk';

export default function Page() {
  const {
    login, logout, isLoading, isLoggedIn,
  } = passport.usePassport();
  const { idToken } = passport.useIdToken();
  const { accessToken } = passport.useAccessToken();
  const { linkedAddresses } = passport.useLinkedAddresses();
  const { userInfo } = passport.useUserInfo();
  const { accounts } = passport.useAccounts();
  const { passportProvider } = passport.usePassportProvider();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport react context example</h1>
      <div className="grid grid-cols-1 gap-4 text-center">
        <div>
          <p className="mb-2">
            <b>Loading:</b>
            {' '}
            {isLoading ? 'true' : 'false'}
          </p>
          <p className="mb-2">
            <b>Is Logged In:</b>
            {' '}
            {isLoggedIn ? 'true' : 'false'}
          </p>
          <p className="mb-2">
            <b>Access Token:</b>
            {' '}
            {accessToken}
          </p>
          <p className="mb-2">
            <b>ID Token:</b>
            {' '}
            {idToken}
          </p>
          <p className="mb-2">
            <b>Linked Addresses:</b>
            {' '}
            {linkedAddresses}
          </p>
          <p className="mb-2">
            <b>User Info:</b>
            {' '}
            {JSON.stringify(userInfo, null, 2)}
          </p>
          <p className="mb-2">
            <b>Accounts:</b>
            {' '}
            {JSON.stringify(accounts, null, 2)}
          </p>
          <p className="mb-2">
            <b>Passport Provider:</b>
            {' '}
            { passportProvider ? 'true' : 'false' }
          </p>
        </div>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={() => login()}
          type="button"
        >
          Login
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

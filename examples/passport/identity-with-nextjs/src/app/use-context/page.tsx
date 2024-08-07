'use client';

import { passport } from '@imtbl/sdk';

export default function Page() {
  // #doc passport-context
  const {
    login, loginWithEthersjs, loginWithoutWallet, logout,
  } = passport.usePassport();
  // #enddoc passport-context
  // #doc passport-hooks
  const { idToken } = passport.useIdToken();
  const { accessToken } = passport.useAccessToken();
  const { linkedAddresses } = passport.useLinkedAddresses();
  const { userInfo } = passport.useUserInfo();
  // #enddoc passport-hooks

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Identity Examples</h1>
      <div className="grid grid-cols-1 gap-4 text-center">
        <div>
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
        </div>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={login}
          type="button"
        >
          Login
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={loginWithoutWallet}
          type="button"
        >
          Login Without Wallet
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={loginWithEthersjs}
          type="button"
        >
          Login With EtherJS
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

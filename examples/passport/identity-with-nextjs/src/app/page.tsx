'use client';

import { usePassport } from '@/context/passport';

export default function Home() {
  const {
    login,
    logout,
    logoutSilent,
    loginWithoutWallet,
    loginWithEthersjs,
    getIdToken,
    getAccessToken,
    getLinkedAddresses,
    getUserInfo,
  } = usePassport();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Identity Examples</h1>
      <div className="space-x-4 space-y-4 max-w-screen-lg w-full">
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
          Login With Ethers.js
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={logout}
          type="button"
        >
          Logout in Redirect mode
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={logoutSilent}
          type="button"
        >
          Logout in Silent mode
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={getIdToken}
          type="button"
        >
          Get ID Token
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={getAccessToken}
          type="button"
        >
          Get Access Token
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={getLinkedAddresses}
          type="button"
        >
          Get Linked Addresses
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          onClick={getUserInfo}
          type="button"
        >
          Get User Info
        </button>
      </div>
    </div>
  );
}

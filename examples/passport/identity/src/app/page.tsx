'use client';

import { usePassport } from "@/context/passport";

export default function Home() {
  const {
    login,
    logout,
    logoutSilent,
    loginWithoutWallet,
    loginWithEthersjs,
    getIdToken,
    getAccessToken,
  } = usePassport();

  return (<>
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Identity Examples</h1>
      <div className="flex flex-wrap space-x-4">
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={login}>Login</button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={logout}>Logout in Redirect
          mode
        </button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={logoutSilent}>Logout in
          Silent mode
        </button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={loginWithoutWallet}>Login
          Without Wallet
        </button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={loginWithEthersjs}>Login
          With Ethers.js
        </button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={getIdToken}>Get ID Token
        </button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={getAccessToken}>Get Access Token
        </button>
      </div>
    </div>
  </>);
}

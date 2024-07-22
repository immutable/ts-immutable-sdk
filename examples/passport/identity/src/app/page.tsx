'use client';

import { usePassport } from "@/context/passport";

export default function Home() {
  const { login, logout, loginWithoutWallet, loginWithEthersjs } = usePassport();

  return (<>
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Identity Examples</h1>
      <div className="flex space-x-4">
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={login}>Login</button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={logout}>Logout</button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={loginWithoutWallet}>Login Without Wallet</button>
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800" onClick={loginWithEthersjs}>Login With Ethers.js</button>
      </div>
    </div>
  </>);
}

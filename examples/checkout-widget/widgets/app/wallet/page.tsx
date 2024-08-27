'use client';

import { usePassport } from "@/src/context/passport";

export default function Page() {
  const { walletWidget, login, logout } = usePassport();
  console.log(walletWidget);
  walletWidget?.mount('wallet');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div id="wallet"></div>
      <button
        className="bg-black text-white py-2 px-4 my-2 rounded hover:bg-gray-800"
        onClick={login}
        type="button"
      >
        Login
      </button>
      <button
        className="bg-black text-white py-2 px-4 my-2 rounded hover:bg-gray-800"
        onClick={logout}
        type="button"
      >
        Logout
      </button>
    </div>
  );
}

'use client';
import { passport } from "@imtbl/sdk";
import { use } from "chai";
import { useEffect } from "react";
import { ethers } from 'ethers';

export default function Page () {
  const { accounts, loading: accLoading, error: loginErr, login } = passport.useLogin();
  const { profile, loading: profileLoading, error: loginWithoutWalletErr, login: loginWithoutWallet } = passport.useLoginWithoutWallet();
  const { accounts: ethAccounts, error: ethErr, loading: ethLoading, login: loginWithEthersjs } = passport.useLoginWithEthersjs(ethers.providers.Web3Provider);
  const { logout, error: logoutError, loading: logoutLoading } = passport.useLogout();
  // const { idToken, error: getIdTokenError, loading: getIdTokenLoading } = passport.useIdToken();
  // const { accessToken, error: getAccessTokenError, loading: getAccessTokenLoading } = passport.useAccessToken();
  // const { linkedAddresses, error: getLinkedAddressesError, loading: getLinkedAddressesLoading } = passport.useLinkedAddresses();
  // const { userInfo, error: getUserInfoError, loading: getUserInfoLoading } = passport.useUserInfo();


  useEffect(() => {
    if (accounts) {
      alert(accounts);
    }
  }, [accounts]);

  useEffect(() => {
    if (profile) {
      alert(JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      alert(JSON.stringify(ethAccounts));
    }
  }, [ethAccounts]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Identity Examples</h1>
      <div className="grid grid-cols-1 gap-4 text-center">
        <div>
          {/* idToken: {idToken}
          accessToken: {accessToken}
          linkedAddresses: {linkedAddresses}
          userInfo: {JSON.stringify(userInfo)} */}
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



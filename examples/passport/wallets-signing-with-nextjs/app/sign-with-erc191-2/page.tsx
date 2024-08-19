"use client";

import { useState } from "react";
import { passportInstance } from "../utils";

export default function PersonalSignWithERC191() {
  // setup the accounts state
  const [accounts, setAccounts] = useState<string[]>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // setup the signed state to show messages on success or failure of signing
  const [signedMessage, setSignedMessage] = useState<string>("(not signed)");

  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();

  // #doc passport-wallets-personal-sign-erc191
  const signMessage = async () => {
    // set signed state message to pending in the view
    setSignedMessage("pending signature");

    // get the account address
    const address = accounts[0];

    // set a message to sign
    const message = "this is a personal sign message";

    try {
      // request for personal_sign RPC call
      const signature = await passportProvider.request({
        method: "personal_sign",
        params: [message, address],
      });

      // Update the signed message in the view
      setSignedMessage(signature);
    } catch (error: any) {
      // Handle user denying signature
      if (error.code === -32003) {
        // if the user declined update the signed message to declined in the view
        setSignedMessage("user declined to sign");
      } else {
        // if something else went wrong, update the generic error with message in the view
        setSignedMessage(`something went wrong - ${error.message}`);
      }
    }
  };
  // #enddoc passport-wallets-personal-sign-erc191

  const passportLogin = async () => {
    setLoadingState(true);

    // calling eth_requestAccounts triggers the Passport login flow
    const accounts = await passportProvider.request({
      method: "eth_requestAccounts",
    });

    // once logged in Passport is connected to the wallet and ready to transact
    setAccounts(accounts);
    setLoadingState(false);
  };

  const passportLogout = async () => {
    setLoadingState(true);
    // reset the account state
    setAccounts([]);
    // logout from passport
    await passportInstance.logout();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="mb-8 text-3xl font-bold">Passport Sign ERC-191 Message</h1>
      {accounts.length === 0 && (
        <button
          className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
          onClick={passportLogin}
          disabled={loading}
        >
          Passport Login
        </button>
      )}
      {accounts.length >= 1 && (
        <>
          <p>
            <button
              className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
              onClick={signMessage}
              disabled={loading}
            >
              Sign Message
            </button>
          </p>
          <br />
          <p>Personal Sign: {signedMessage.substring(0, 40)}</p>
          <br />
          <p>
            <button
              className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
              onClick={passportLogout}
              disabled={loading}
            >
              Passport Logout
            </button>
          </p>
        </>
      )}
      <br />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>
          Connected Account:{" "}
          {accounts.length >= 1 ? accounts : "(not connected)"}
        </p>
      )}
      <br />
      <a href="/" className="underline">
        Return to Examples
      </a>
    </div>
  );
}

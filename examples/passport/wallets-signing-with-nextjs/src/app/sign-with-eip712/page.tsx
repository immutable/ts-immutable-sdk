'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { passportInstance } from '../utils';

export default function ConnectWithEtherJS() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // setup the signed state to show messages on success or failure
  const [signed, setSignedState] = useState<string>('(not signed)');

  // #doc passport-wallets-nextjs-sign-eip712-create
  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();

  // create the Web3Provider using the Passport provider
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);
  // #enddoc passport-wallets-nextjs-sign-eip712-create

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      // disable button while loading
      setLoadingState(true);

      // #doc passport-wallets-nextjs-sign-eip712-request
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.provider.request({ method: 'eth_requestAccounts' });
      // #enddoc passport-wallets-nextjs-sign-eip712-request

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    // reset the account state
    setAccountsState([]);
    // logout from passport
    await passportInstance.logout();
  };

  // #doc passport-wallets-nextjs-sign-eip712-signmessage
  const signMessage = async () => {
    // set signed state message to pending in the view
    setSignedState('pending signature');

    // fetch the signer from the Web3provider
    const signer = web3Provider.getSigner();

    // set the chainId
    const chainId = 13473; // zkEVM testnet

    // set the sender address
    const address = await signer.getAddress();

    // Define our "domain separator" to ensure user signatures are unique across apps/chains
    const domain = {
      name: 'Ether Mail',
      version: '1',
      chainId,
      verifyingContract: address,
    };

    // setup the types for displaying the message in the signing window
    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    };

    // setup the message to be signed
    const message = {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    };

    try {
      // attempt to sign the message, this brings up the passport popup
      // eslint-disable-next-line no-underscore-dangle
      await signer._signTypedData(domain, types, message);

      // if successful update the signed message to successful in the view
      setSignedState('user successfully signed message');
    } catch (error: any) {
      // Handle user denying signature
      if (error.code === 4001) {
        // if the user declined update the signed message to declined in the view
        setSignedState('user declined to sign');
      } else {
        // if something else went wrong, update the generic error with message in the view
        setSignedState(`something went wrong - ${error.message}`);
      }
    }
  };
  // #enddoc passport-wallets-nextjs-sign-eip712-signmessage

  // render the view to login/logout and show the connected accounts and sign message
  return (
    <>
      <h1>Passport Wallets - Sign EIP-712 message</h1>
      {accountsState.length === 0
      && <button onClick={passportLogin} disabled={loading}>Passport Login</button>}
      {accountsState.length >= 1 && (
      <>
        <p>
          <button onClick={signMessage} disabled={loading}>Sign Message</button>
        </p>
        <p>
          Message Signed:
          {signed}
        </p>
        <p>
          <button onClick={passportLogout} disabled={loading}>Passport Logout</button>
        </p>
      </>
      )}
      {loading
        ? <p>Loading...</p>
        : (
          <p>
            Connected Account:
            {accountsState.length >= 1 ? accountsState : '(not connected)'}
          </p>
        )}
      <p>
        <a href="/">Return to Examples</a>
      </p>
    </>
  );
}

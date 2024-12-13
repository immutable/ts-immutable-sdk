'use client';

import { hashMessage } from 'ethers';
import { passportInstance } from '../utils/passport';
import { passport } from '@imtbl/sdk';
import { isValidSignature } from '../utils/isValidSignature';
import { Button, Heading, Link, Table } from '@biom3/react';
import NextLink from 'next/link';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { Provider } from '@imtbl/sdk/passport';

export default function ConnectWithEtherJS() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // setup the signed/verified state to show messages on success or failure of signing
  const [signedStateMessage, setSignedMessageState] = useState<string>('(not signed)');

  const [verifiedStateMessage, setVerifiedStateMessage] = useState<string>('(not verified)');

  //setup necessary states for signature verification
  const [address, setAddress] = useState<string>('')

  const [personalMessage, setPersonalMessage] = useState<string>('');

  const [msgSignature, setSignature] = useState<string>('')
  // #doc passport-wallets-nextjs-sign-erc191-create

  // fetch the Passport provider from the Passport instance
  const [passportProvider, setPassportProvider] = useState<Provider>();

  useEffect(() => {
    const fetchPassportProvider = async () => {
      const passportProvider = await passportInstance.connectEvm();
      setPassportProvider(passportProvider);
    };
    fetchPassportProvider();
  }, []);

  // create the BrowserProvider using the Passport provider
  const browserProvider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);
  // #enddoc passport-wallets-nextjs-sign-erc191-create

  const passportLogin = async () => {
    if (browserProvider?.send) {
      // disable button while loading
      setLoadingState(true);

      // #doc passport-wallets-nextjs-sign-erc191-request
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      // #enddoc passport-wallets-nextjs-sign-erc191-request
      
      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    // hide table while logging out
    setLoggingOut(true);
    // reset the account state
    setAccountsState([]);
    // logout from passport
    await passportInstance.logout();
  };

  // #doc passport-wallets-nextjs-sign-erc191-signmessage
  const signMessage = async () => {
    if (!browserProvider) return;

    // set signed state message to pending in the view
    setSignedMessageState('pending signature');

    // fetch the signer from the BrowserProvider
    const signer = await browserProvider.getSigner();

    const address = await signer.getAddress();
    setAddress(address);

    // Create the message to be signed
    // Please note there is a 500 character limit for the message
    const message = 'this is a personal sign message';

    setPersonalMessage(message);

    try {
      if (!signer) {
        throw new Error('No signer found');
      }

      // attempt to sign the message, this brings up the passport popup
      const signature = await signer.signMessage(message);
      setSignature(signature);
      // if successful update the signed message to successful in the view
      setSignedMessageState('user successfully signed message');

    } catch (error: any) {
      // Handle user denying signature
      if (error.code === -32003) {
        // if the user declined update the signed message to declined in the view
        setSignedMessageState('user declined to sign');
      } else {
        // if something else went wrong, update the generic error with message in the view
        setSignedMessageState(`something went wrong - ${error.message}`);
        console.log(error)
      }
    }
  };
  // #enddoc passport-wallets-nextjs-sign-erc191-signmessage

  // #doc passport-wallets-nextjs-sign-erc191-verifysignature
  const isValidERC191Signature = async (
    address: string, // The wallet address returned from eth_requestAccounts
    payload: string, // The message string
    signature: string, // The signature
    zkEvmProvider: passport.Provider, // Can be any provider, Passport or not
  ) => {
    const digest = hashMessage(payload);
  
    return isValidSignature(address, digest, signature, zkEvmProvider);
  };

  const verifySignature = async () => {
    setVerifiedStateMessage("Pending Verification");

    try {
      if (!passportProvider) {
        throw new Error('Passport provider not found');
      }
      // validate the signature
      const isValid = await isValidERC191Signature(address, personalMessage, msgSignature, passportProvider);
      isValid ? setVerifiedStateMessage("Signature verified") : setVerifiedStateMessage("Signature couldn't be verified");

    } catch (error: any) {
      // if something else went wrong, update the generic error with message in the view
      setVerifiedStateMessage(`something went wrong - ${error.message}`);
      console.log(error);
    }
  }
  // #enddoc passport-wallets-nextjs-sign-erc191-verifysignature

  // render the view to login/logout and show the connected accounts and sign message
  return (
    <>
      <Heading className="mb-1">Passport Sign ERC-191 Message</Heading>
      {(accountsState.length === 0 && !loggingOut)
      && (
        <Button
        className="mb-1"
        size="medium"
        onClick={passportLogin}
        disabled={loading}
      >
        Passport Login
      </Button>
      )}
      {accountsState.length >= 1 && (
      <>
        <p>
          <Button
            className="mb-1"
            size="medium"
            onClick={signMessage}
            disabled={loading}
          >
            Sign Message
          </Button>
        </p>
        <p>
          Message Signed: {signedStateMessage}
        </p>
        <br />
        <p>
          <Button
            className="mb-1"
            size="medium"
            onClick={verifySignature}
            disabled={loading || !personalMessage || !msgSignature}
          >
            Verify Message
          </Button>
        </p>
        <p>
          Message Verified: {verifiedStateMessage}
        </p>
        <br />
        <p>
          <Button
            className="mb-1"
            onClick={passportLogout}
            disabled={loading}
          >
            Passport Logout
          </Button>
        </p>
      </>
      )}
      <br />
      {loggingOut ? (
        <h1 className="text-3xl font-bold mb-8">Logging Out...</h1>
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Item</Table.Cell>
                <Table.Cell>Value</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell><b>Connected Account</b></Table.Cell>
                <Table.Cell>
                  {accountsState.length === 0 && (
                    <span>(not&nbsp;connected)</span>
                  )
                  }
                  {accountsState.length > 0 && accountsState[0]}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          <br />
          <Link rc={<NextLink href="/" />}>Return to Examples</Link>
        </>
      )}
  </>
  );
}

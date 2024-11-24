'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../utils/passport';
import { Button, Heading, Link, Table } from '@biom3/react';
import NextLink from 'next/link';

export default function ConnectWithEtherJS() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // #doc passport-wallets-nextjs-connect-etherjs-create
  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();

  // create the Web3Provider using the Passport provider
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);
  // #enddoc passport-wallets-nextjs-connect-etherjs-create

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      // disable button while loading
      setLoadingState(true);

      // #doc passport-wallets-nextjs-connect-etherjs-request
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.provider.request({ method: 'eth_requestAccounts' });
      // #enddoc passport-wallets-nextjs-connect-etherjs-request

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    setAccountsState(accounts);
  });

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    // reset the account state
    setAccountsState([]);
    // logout from passport
    await passportInstance.logout();
  };

  // render the view to login/logout and show the connected accounts
  return (
    <>
      <Heading className="mb-1">Passport Connect with EtherJS</Heading>
      {accountsState.length === 0
      && (
        <Button       
        className="mb-1"
        size="medium" 
        onClick={passportLogin}
        disabled={loading}>
        Passport Login
      </Button>
      )}
      {accountsState.length >= 1
      && (
        <Button       
        className="mb-1"
        size="medium" 
        onClick={passportLogout}
        disabled={loading}>
        Passport Logout
      </Button> 
      )}
      <br />
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
  );
}

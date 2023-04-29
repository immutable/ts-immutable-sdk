import Connect from '../components/Connect';
import { useState } from 'react';
import SwitchNetwork from '../components/SwitchNetwork';
import { Web3Provider } from '@ethersproject/providers';
import GetAllBalances from '../components/GetAllBalances';
import CheckConnection from '../components/CheckConnection';
import GetAllowedLists from '../components/GetAllowedList';
import { Body, Divider, Heading } from '@biom3/react';
import GetBalance from '../components/GetBalance';

export default function ConnectWidget() {
  const [provider, setProvider] = useState<Web3Provider>();

  return (
    <div>
      <Heading>Connect</Heading>
      <Body>
        This page demonstrates how to utilise the Checkout SDK in order to
        replicate the features of the Connect Widget.
      </Body>

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Connect
      </Divider>
      <Connect setProvider={setProvider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Check connection
      </Divider>
      <CheckConnection provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Switch network
      </Divider>
      <SwitchNetwork provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Get wallet balance
      </Divider>
      <GetBalance provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Get wallet balances
      </Divider>
      <GetAllBalances provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Get allowed lists
      </Divider>
      <GetAllowedLists provider={provider} />
    </div>
  );
}

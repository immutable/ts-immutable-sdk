import Connect from '../components/Connect';
import { useState } from 'react';
import SwitchNetwork from '../components/SwitchNetwork';
import { Web3Provider } from '@ethersproject/providers';
import GetAllBalances from '../components/GetAllBalances';
import CheckConnection from '../components/CheckConnection';
import GetAllowList from '../components/GetAllowList';
import { Body, Divider, Heading } from '@biom3/react';
import GetBalance from '../components/GetBalance';

export default function ConnectWidget() {
  const [provider, setProvider] = useState<Web3Provider>();

  return (
    <div>
      <Heading>Connect</Heading>
      <Body>
        Manage connections, switch networks, and access vital wallet/SDK
        information. Monitor wallet balances, retrieve balance data, and manage
        allowed lists for networks, wallets, and tokens, providing a streamlined
        experience for your digital asset needs.
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
      <GetAllowList provider={provider} />
    </div>
  );
}

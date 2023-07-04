import Connect from '../components/Connect';
import { useMemo, useState } from 'react';
import SwitchNetwork from '../components/SwitchNetwork';
import { Web3Provider } from '@ethersproject/providers';
import GetAllBalances from '../components/GetAllBalances';
import CheckConnection from '../components/CheckConnection';
import GetAllowList from '../components/GetAllowList';
import { Body, Box, Checkbox, Divider, Heading, Toggle } from '@biom3/react';
import GetBalance from '../components/GetBalance';
import { Checkout } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import Provider from '../components/Provider';
import SendTransaction from '../components/SendTransaction';

export default function ConnectWidget() {
  const [environment, setEnvironment] = useState(Environment.SANDBOX);
  const checkout = useMemo(() => {
    return new Checkout({ baseConfig: { environment: environment } });
  }, [environment]);
  const [provider, setProvider] = useState<Web3Provider>();

  function toggleEnvironment() {
    if (environment === Environment.PRODUCTION) {
      setEnvironment(Environment.SANDBOX);
    } else {
      setEnvironment(Environment.PRODUCTION);
    }
  }

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
        Toggle Checkout Environment
      </Divider>
      <Heading size="xSmall">Environment: {environment.toUpperCase()}</Heading>

      <Box sx={{ display: 'flex', gap: 'base.spacing.x2', marginBottom: 'base.spacing.x2' }}>
        <Checkbox
          checked={environment === Environment.PRODUCTION}
          onChange={() => setEnvironment(Environment.PRODUCTION)}
        />
        <Heading size="xSmall">{Environment.PRODUCTION.toUpperCase()}</Heading>
      </Box>
      <Box sx={{ display: 'flex', gap: 'base.spacing.x2', marginBottom: 'base.spacing.x2' }}>
        <Checkbox
          checked={environment === Environment.SANDBOX}
          onChange={() => setEnvironment(Environment.SANDBOX)}
        />
        <Heading size="xSmall">{Environment.SANDBOX.toUpperCase()} / DEV MODE</Heading>
      </Box>

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Provider
      </Divider>
      <Provider
        checkout={checkout}
        setProvider={setProvider}
        provider={provider}
      />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Connect
      </Divider>
      <Connect 
        checkout={checkout} 
        provider={provider}
        setProvider={setProvider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Check connection
      </Divider>
      <CheckConnection checkout={checkout} provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Switch network
      </Divider>
      <SwitchNetwork
        checkout={checkout}
        provider={provider}
        setProvider={setProvider}
      />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Get wallet balance
      </Divider>
      <GetBalance checkout={checkout} provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Get wallet balances
      </Divider>
      <GetAllBalances checkout={checkout} provider={provider} />

      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Send Transaction
      </Divider>
      <SendTransaction
        checkout={checkout}
        provider={provider}
        setProvider={setProvider}
      />


      <Divider
        sx={{
          marginTop: 'base.spacing.x6',
          marginBottom: 'base.spacing.x2',
        }}
      >
        Get allowed lists
      </Divider>
      <GetAllowList checkout={checkout} provider={provider} />
    </div>
  );
}

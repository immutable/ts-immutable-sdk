import { Body, Box, Checkbox, Divider, Heading } from '@biom3/react';
import { Environment } from '@imtbl/config';
import CheckConnection from '../components/CheckConnection';
import Connect from '../components/Connect';
import Provider from '../components/Provider';
import { Checkout } from '@imtbl/checkout-sdk';
import { useState, useMemo } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import Buy from '../components/Buy';

export default function SmartCheckout() {
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
      <Heading>Smart Checkout</Heading>
      <Body>
        Smart checkout flows such as buy, sell and cancel.
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
        Buy
      </Divider>
      <Buy
        checkout={checkout} 
        provider={provider} />
    </div>
  );
}
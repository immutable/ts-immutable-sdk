import {
  Checkout,
  ConnectionProviders,
  DefaultProviders,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useMemo, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Environment } from '@imtbl/config';
import { Box } from '@biom3/react';

interface ProviderProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
  setProvider: (provider: Web3Provider) => void;
}

export default function Provider(props: ProviderProps) {
  const { setProvider, checkout, provider } = props;

  const [result, setResult] = useState<Web3Provider>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function createMetamaskClick() {
    setError(null);
    setLoading(true);
    try {
      const resp = await checkout.createProvider({
        providerName: DefaultProviders.METAMASK,
      });
      setProvider(resp.web3Provider);
      setResult(resp.web3Provider);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  async function setProviderClick() {
    setError(null);
    setLoading(true);
    try {
      const resp = await checkout.setProvider([
        {
          name: 'metamask',
          web3Provider: provider,
        },
      ]);
      // setProvider(resp.web3Provider);
      console.log(resp);
      //setResult(resp);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  useEffect(() => {
    // reset state wehn checkout changes from environment switch
    setResult(undefined);
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <div>
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={createMetamaskClick} loading={loading}>
          Create Metamask Provider
        </LoadingButton>
        {result && !error && <SuccessMessage>Provider Created.</SuccessMessage>}
        {error && (
          <ErrorMessage>
            {error.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={setProviderClick} loading={loading}>
          Set Provider
        </LoadingButton>
        {result && !error && (
          <SuccessMessage>
            <Box>Provider Set for Available Networks.</Box>
            <pre>{JSON.stringify(result)}</pre>
          </SuccessMessage>
        )}
        {error && (
          <ErrorMessage>
            {error.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>
    </div>
  );
}

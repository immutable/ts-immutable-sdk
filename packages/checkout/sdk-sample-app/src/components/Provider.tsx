import {
  Checkout,
  DefaultProviders,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Box } from '@biom3/react';

interface ProviderProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
  setProvider: (provider: Web3Provider) => void;
}

export default function Provider(props: ProviderProps) {
  const { setProvider, checkout, provider } = props;

  const [result1, setResult1] = useState<Web3Provider>();

  const [error1, setError1] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);

  async function createMetamaskClick() {
    setError1(null);
    setLoading(true);
    try {
      const resp = await checkout.createProvider({
        providerName: DefaultProviders.METAMASK,
      });
      setProvider(resp.provider);
      setResult1(resp.provider);
      setLoading(false);
    } catch (err: any) {
      setError1(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  useEffect(() => {
    // reset state wehn checkout changes from environment switch
    setResult1(undefined);
    setError1(null);
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
          Create Metamask Web3Provider
        </LoadingButton>
        {result1 && !error1 && (
          <SuccessMessage>Web3Provider Created.</SuccessMessage>
        )}
        {error1 && (
          <ErrorMessage>
            {error1.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>
    </div>
  );
}

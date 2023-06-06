import { Checkout, ChainId, NetworkInfo, DefaultProviders } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import { NetworkFilterTypes } from '@imtbl/checkout-sdk';
import { utils } from 'ethers';

export interface SendTransactionProps {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  setProvider: (provider: Web3Provider) => void;
}

export default function SendTransaction(props: SendTransactionProps) {
  const { provider, checkout, setProvider } = props;

  const [result, setResult] = useState<NetworkInfo>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [availableNetworks, setAvailableNetworks] = useState<NetworkInfo[]>([]);

  useEffect(() => {
    async function getNetworks() {
      if (!checkout) return [];

      const result = await checkout.getNetworkAllowList({
        type: NetworkFilterTypes.ALL,
        exclude: [],
      });

      setAvailableNetworks(result.networks);

      // reset state wehn checkout changes from environment switch
      setResult(undefined);
      setError(null);
      setLoading(false);
    }

    getNetworks();
  }, [checkout]);

  async function sendTxClick() {
    if (!checkout) {
      console.error('missing checkout, please connect frist');
      return;
    }
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }

    // const defaultProvider = await checkout.createDefaultProvider({providerName:DefaultProviders.METAMASK})

    setError(null);
    setLoading(true);

    try {
      const resp = await checkout.checkIsWalletConnected({
        provider,
      });
      const transaction = {
        from: resp.walletAddress, // The user's active address.
        to: '0x72E45FF29bcF2C8640a025585A4fB58cC2dd1bfb', // Required except during contract publications.
        value: utils.parseUnits('0.0001', 'ether').toHexString()
      }
  
      try {
        const resp = await checkout.sendTransaction({
          provider,
          transaction,
        });
  
        console.log('resp', resp)
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
        console.log(err.message);
        console.log(err.type);
        console.log(err.data);
        console.log(err.stack);
      }
    } catch(err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  

    
  }

  return (
    <div>
      <Box sx={{ marginTop: 'base.spacing.x4' }}>
        <LoadingButton
          onClick={() => sendTxClick()}
          loading={loading}
        >
          Send Transaction
        </LoadingButton>
        {result && !error && (
          <SuccessMessage>
            <Box>Transaction Complete</Box>
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

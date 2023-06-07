import { Checkout, ChainId, NetworkInfo } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import LoadingButton from './LoadingButton';
import { useCallback, useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import { NetworkFilterTypes } from '@imtbl/checkout-sdk';

export interface SwitchNetworkProps {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  setProvider: (provider: Web3Provider) => void;
}

export default function SwitchNetwork(props: SwitchNetworkProps) {
  const { provider, checkout, setProvider } = props;

  const [result, setResult] = useState<NetworkInfo>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [resultNetInfo, setResultNetInfo] = useState<NetworkInfo>();
  const [errorNetInfo, setErrorNetInfo] = useState<any>(null);
  const [loadingNetInfo, setLoadingNetInfo] = useState<boolean>(false);

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
      setResultNetInfo(undefined);
      setErrorNetInfo(null);
      setLoadingNetInfo(false);
    }

    getNetworks();
  }, [checkout]);

  const switchNetwork = useCallback(async(chainId: ChainId) => {
    if (!checkout) {
      console.error('missing checkout, please connect frist');
      return;
    }
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log(provider)
      const resp = await checkout.switchNetwork({
        provider,
        chainId,
      });
      setProvider(resp.provider);
      setResult(resp.network);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }, [checkout, provider]);

  async function getNetworkInfo() {
    if (!checkout) {
      console.error('missing checkout, please connect frist');
      return;
    }
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }

    setErrorNetInfo(null);
    setLoadingNetInfo(true);

    try {
      const resp = await checkout.getNetworkInfo({ provider });

      console.log('resp', resp)
      setResultNetInfo(resp);
      setLoadingNetInfo(false);
    } catch (err: any) {
      setErrorNetInfo(err);
      setLoadingNetInfo(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  return (
    <div>
      <Box>
        {!provider && <WarningMessage>Not connected.</WarningMessage>}
        <Box
          sx={{
            marginTop: 'base.spacing.x4',
            display: 'flex',
            gap: 'base.spacing.x4',
          }}
        >
          {availableNetworks.map((networkInfo) => {
            return (
              <LoadingButton
                key={networkInfo.name}
                onClick={() => switchNetwork(networkInfo.chainId as ChainId)}
                loading={loading}
              >
                Switch to {networkInfo.name}
              </LoadingButton>
            );
          })}
        </Box>
        {result && !error && (
          <SuccessMessage>Connected to {result?.name}.</SuccessMessage>
        )}
        {error && (
          <ErrorMessage>
            {error.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>

      <Box sx={{ marginTop: 'base.spacing.x4' }}>
        <LoadingButton
          onClick={() => getNetworkInfo()}
          loading={loadingNetInfo}
        >
          Network info
        </LoadingButton>
        {resultNetInfo && !errorNetInfo && (
          <SuccessMessage>
            <Box>ChainId: {resultNetInfo.chainId}</Box>
            <Box>Name: {resultNetInfo.name}</Box>
            { resultNetInfo.isSupported && (
              <Box>Symbol: {resultNetInfo.nativeCurrency.symbol}</Box>
            )}
            <Box>Supported: {resultNetInfo.isSupported ? 'true' : 'false'}</Box>
          </SuccessMessage>
        )}
        {errorNetInfo && (
          <ErrorMessage>
            {errorNetInfo.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>
    </div>
  );
}

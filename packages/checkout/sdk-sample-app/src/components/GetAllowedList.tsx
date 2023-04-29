import {
  ChainId,
  Checkout,
  NetworkFilterTypes,
  TokenFilterTypes,
  WalletFilterTypes,
} from '@imtbl/checkout-sdk-web';
import { Web3Provider } from '@ethersproject/providers';
import { useMemo, useState } from 'react';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import LoadingButton from './LoadingButton';
import { Box } from '@biom3/react';
import { NetworkInfo } from '@imtbl/checkout-sdk-web';
import { WalletInfo } from '@imtbl/checkout-sdk-web';
import { TokenInfo } from '@imtbl/checkout-sdk-web';

export interface AllowedListProps {
  provider: Web3Provider | undefined;
}

export default function GetAllowedLists(props: AllowedListProps) {
  const checkout = useMemo(() => new Checkout(), []);
  const { provider } = props;

  const [resultNetwork, setResultNetwork] = useState<NetworkInfo[]>();
  const [errorNetwork, setErrorNetwork] = useState<any>(null);
  const [loadingNetwork, setLoadingNetwork] = useState<boolean>(false);

  const [resultWallet, setResultWallet] = useState<WalletInfo[]>();
  const [errorWallet, setErrorWallet] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  const [resultToken, setResultToken] = useState<TokenInfo[]>();
  const [errorToken, setErrorToken] = useState<any>(null);
  const [loadingToken, setLoadingToken] = useState<boolean>(false);

  async function getNetworkAllowedList() {
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }
    setErrorNetwork(null);
    setLoadingNetwork(true);
    try {
      const resp = await checkout.getNetworkAllowList({
        type: NetworkFilterTypes.ALL,
      });
      setResultNetwork(resp.networks);
      setLoadingNetwork(false);
    } catch (error: any) {
      setErrorNetwork(error);
      setLoadingNetwork(false);
      console.log(error.message);
      console.log(error.type);
      console.log(error.data);
      console.log(error.stack);
    }
  }

  async function getWalletsAllowedList() {
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }
    setErrorWallet(null);
    setLoadingWallet(true);
    try {
      const resp = await checkout.getWalletsAllowList({
        type: WalletFilterTypes.ALL,
      });
      setResultWallet(resp.wallets);
      setLoadingWallet(false);
    } catch (error: any) {
      setErrorWallet(error);
      setLoadingWallet(false);
      console.log(error.message);
      console.log(error.type);
      console.log(error.data);
      console.log(error.stack);
    }
  }

  async function getTokensAllowedList() {
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }
    setErrorToken(null);
    setLoadingToken(true);
    try {
      const resp = await checkout.getTokenAllowList({
        type: TokenFilterTypes.ALL,
        chainId: ChainId.ETHEREUM,
      });
      setResultToken(resp.tokens);
      setLoadingToken(false);
    } catch (error: any) {
      setErrorToken(error);
      setLoadingToken(false);
      console.log(error.message);
      console.log(error.type);
      console.log(error.data);
      console.log(error.stack);
    }
  }

  return (
    <div>
      {!provider && <WarningMessage>Not connected.</WarningMessage>}
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
          display: 'flex',
          gap: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={getNetworkAllowedList} loading={loadingNetwork}>
          Get network allowed list
        </LoadingButton>
        <LoadingButton onClick={getWalletsAllowedList} loading={loadingWallet}>
          Get wallets allowed list
        </LoadingButton>
        <LoadingButton onClick={getTokensAllowedList} loading={loadingToken}>
          Get tokens allowed list
        </LoadingButton>
      </Box>

      {resultNetwork && !errorNetwork && (
        <SuccessMessage>
          {resultNetwork?.map((network) => (
            <div key={network.chainId}>
              <Box>
                ({network.chainId}) - {network.name} -
                {network.nativeCurrency.symbol}
              </Box>
            </div>
          ))}
        </SuccessMessage>
      )}
      {errorNetwork && (
        <ErrorMessage>
          {errorNetwork.message}. Check console logs for more details.
        </ErrorMessage>
      )}

      {resultWallet && !errorWallet && (
        <SuccessMessage>
          {resultWallet?.map((wallet) => (
            <div key={wallet.name}>
              <Box>
                <img src={wallet.icon} />
                {wallet.name}: {wallet.description}
              </Box>
            </div>
          ))}
        </SuccessMessage>
      )}
      {errorWallet && (
        <ErrorMessage>
          {errorWallet.message}. Check console logs for more details.
        </ErrorMessage>
      )}

      {resultToken && !errorToken && (
        <SuccessMessage>
          {resultToken?.map((token) => (
            <div key={token.name}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'base.spacing.x2',
                }}
              >
                <img src={token.icon} width="15px" /> {token.name} -{' '}
                {token.symbol} - {token.address}
              </Box>
            </div>
          ))}
        </SuccessMessage>
      )}
      {errorToken && (
        <ErrorMessage>
          {errorToken.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </div>
  );
}

import pako from 'pako';
import { useCallback, useEffect, useState } from 'react';
import { Environment } from '@imtbl/config';

import { TransakNFTData } from './TransakTypes';

export type TransakWidgetType = 'on-ramp' | 'nft-checkout';

export type TransakNFTCheckoutParams = {
  nftData: TransakNFTData[];
  calldata: string;
  cryptoCurrencyCode: string;
  estimatedGasLimit: number;
  smartContractAddress: string;
  exchangeScreenTitle: string;
  partnerOrderId?: string;
  walletAddress?: string;
  email?: string;
};

type UseTransakIframeProps = {
  type: TransakWidgetType;
} & TransakNFTCheckoutParams;

const MAX_GAS_LIMIT = '30000000';

// TODO: Move to common config file inside Checkout SDK while refactoring onRamp
// const { baseUrl, apiKey } = checkout.fiatExchangeConfig('transak')
export const TRANSAK_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://global-stg.transak.com',
  [Environment.PRODUCTION]: 'https://global.transak.com/',
};

export const useTransakIframe = (props: UseTransakIframeProps) => {
  const { type, ...transakParams } = props;
  const [iframeSrc, setIframeSrc] = useState<string>('');

  // TODO: Get transak config from checkout SDK
  // const { checkout, provider } = connectLoaderState;
  // const {  config } = checkout.fiatExchangeConfig('transak');
  // const { environment, apiKey, network } = config
  const environment = 'sandbox';
  const apiKey = 'd14b44fb-0f84-4db5-affb-e044040d724b';
  const network = 'immutablezkevm';

  const getNFTCheckoutURL = useCallback(() => {
    const {
      calldata,
      nftData: nfts,
      estimatedGasLimit,
      ...restTransakParams
    } = transakParams;

    // FIXME: defaulting to first nft in the list
    // as transak currently only supports on nft at a time
    const nftData = nfts?.slice(0, 1);

    const gasLimit = estimatedGasLimit > 0 ? estimatedGasLimit : MAX_GAS_LIMIT;

    const params = {
      apiKey,
      network,
      isNFT: 'true',
      disableWalletAddressForm: 'true',
      environment: 'STAGING',
      calldata: btoa(String.fromCharCode.apply(null, pako.deflate(calldata))),
      nftData: btoa(JSON.stringify(nftData)),
      estimatedGasLimit: gasLimit.toString(),
      ...restTransakParams,
      themeColor: '0D0D0D',
    };

    const baseUrl = `${TRANSAK_API_BASE_URL[environment]}?`;
    const queryParams = new URLSearchParams(params);
    const widgetUrl = `${baseUrl}${queryParams.toString()}`;

    return widgetUrl;
  }, [props]);

  useEffect(() => {
    setIframeSrc(getNFTCheckoutURL());
  }, [props]);

  return { iframeSrc };
};

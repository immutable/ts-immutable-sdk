import pako from 'pako';
import { useCallback, useEffect, useState } from 'react';
import { Environment } from '@imtbl/config';

import { sanitizeToLatin1 } from 'widgets/sale/functions/utils';
import { TransakNFTData } from './TransakTypes';

export type TransakWidgetType = 'on-ramp' | 'nft-checkout';

export type TransakNFTCheckoutParams = {
  nftData: TransakNFTData[];
  calldata: string;
  cryptoCurrencyCode: string;
  estimatedGasLimit: number;
  exchangeScreenTitle: string;
  partnerOrderId?: string;
  walletAddress?: string;
};

type UseTransakIframeProps = {
  type: TransakWidgetType;
  contractId: string;
  environment: Environment;
  transakParams: TransakNFTCheckoutParams;
};

const MAX_GAS_LIMIT = '30000000';

// TODO: Move to common config file inside Checkout SDK while refactoring onRamp
// TODO: Get transak config from checkout SDK
// const { checkout, provider } = connectLoaderState;
// const { baseUrl, apiKey, environment } = checkout.fiatExchangeConfig('transak')
export const TRANSAK_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://global-stg.transak.com',
  [Environment.PRODUCTION]: 'https://global.transak.com/',
};

export const TRANSAK_ENVIRONMENT = {
  [Environment.SANDBOX]: 'STAGING',
  [Environment.PRODUCTION]: 'PRODUCTION',
};

export const TRANSAK_API_KEY = {
  [Environment.SANDBOX]: 'd14b44fb-0f84-4db5-affb-e044040d724b',
  [Environment.PRODUCTION]: 'ad1bca70-d917-4628-bb0f-5609537498bc',
};

export const useTransakIframe = (props: UseTransakIframeProps) => {
  const { contractId, environment, transakParams } = props;
  const [iframeSrc, setIframeSrc] = useState<string>('');

  const getNFTCheckoutURL = useCallback(() => {
    const {
      calldata,
      nftData: nfts,
      estimatedGasLimit,
      ...restTransakParams
    } = transakParams;

    // FIXME: defaulting to first nft in the list
    // as transak currently only supports on nft at a time
    const nftData = nfts?.slice(0, 1).map((item) => ({
      ...item,
      imageURL: sanitizeToLatin1(item.imageURL),
      nftName: sanitizeToLatin1(item.nftName),
    }));

    const gasLimit = estimatedGasLimit > 0 ? estimatedGasLimit : MAX_GAS_LIMIT;

    const params = {
      apiKey: TRANSAK_API_KEY[environment],
      isNFT: 'true',
      disableWalletAddressForm: 'true',
      contractId,
      environment: TRANSAK_ENVIRONMENT[environment],
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

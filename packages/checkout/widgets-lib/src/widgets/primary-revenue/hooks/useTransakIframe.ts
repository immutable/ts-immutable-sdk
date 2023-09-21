import { Environment } from '@imtbl/config';
import { useCallback, useEffect, useState } from 'react';

export type TransakNFTData = {
  imageURL: string;
  quantity: string;
  nftName: string;
  collectionAddress: string;
  tokenID: Array<number>;
  price: Array<number>;
};

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
    // FIXME: environment will be set by checkout config
    const sanitisedTransakParams = Object.entries(transakParams).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: typeof value === 'string' ? value : JSON.stringify(value),
      }),
      {},
    );

    const params = {
      isNFT: 'true',
      disableWalletAddressForm: 'true',
      apiKey,
      network,
      environment: 'STAGING',
      ...sanitisedTransakParams,
    };

    const baseUrl = `${TRANSAK_API_BASE_URL[environment]}?`;
    const queryParams = new URLSearchParams(params);
    const widgetUrl = `${baseUrl}${queryParams.toString()}`;

    console.log(transakParams, widgetUrl);
    return widgetUrl;
  }, [props]);

  useEffect(() => {
    setIframeSrc(getNFTCheckoutURL());
  }, [props]);

  return { iframeSrc };
};

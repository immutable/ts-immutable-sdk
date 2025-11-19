/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useEffect, useState } from 'react';
import { Environment } from '@imtbl/config';

import { sanitizeToLatin1 } from '../../widgets/sale/functions/utils';
import { TransakNFTData } from './TransakTypes';

export type TransakWidgetType = 'on-ramp' | 'nft-checkout';

export type TransakNFTCheckoutParams = {
  nftData: TransakNFTData[];
  calldata: string;
  cryptoCurrencyCode: string;
  estimatedGasLimit: number;
  exchangeScreenTitle: string;
  walletAddress: string;
  email: string;
  partnerOrderId?: string;
  excludeFiatCurrencies?: string[];
};

type UseTransakIframeProps = {
  type: TransakWidgetType;
  contractId: string;
  environment: Environment;
  transakParams: TransakNFTCheckoutParams;
  onError?: () => void;
};

const MAX_GAS_LIMIT = 30000000;

export const TRANSAK_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://api-stg.transak.com',
  [Environment.PRODUCTION]: 'https://api.transak.com',
};

export const TRANSAK_API_KEY = {
  [Environment.SANDBOX]: 'd14b44fb-0f84-4db5-affb-e044040d724b',
  [Environment.PRODUCTION]: 'ad1bca70-d917-4628-bb0f-5609537498bc',
};

export const IMMUTABLE_API_BASE_URL = {
  development: 'https://api.dev.immutable.com',
  [Environment.SANDBOX]: 'https://api.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://api.immutable.com',
};

export const useTransakIframe = (props: UseTransakIframeProps) => {
  const {
    contractId, environment, transakParams, onError,
  } = props;
  const [iframeSrc, setIframeSrc] = useState<string>('');

  const getNFTCheckoutURL = useCallback(async () => {
    try {
      const {
        calldata,
        nftData: nfts,
        estimatedGasLimit,
        cryptoCurrencyCode,
        excludeFiatCurrencies,
        exchangeScreenTitle,
        email,
        walletAddress,
        partnerOrderId,
      } = transakParams;

      // FIXME: defaulting to first nft in the list
      // as transak currently only supports on nft at a time
      const nftData = nfts?.slice(0, 1)
        .map((item) => ({
          collection_address: item.collectionAddress,
          image_url: sanitizeToLatin1(item.imageURL),
          nft_name: sanitizeToLatin1(item.nftName),
          nft_type: item.nftType,
          price: item.price,
          quantity: item.quantity,
          token_id: item.tokenID,
        }));

      const gasLimit = estimatedGasLimit > 0 ? estimatedGasLimit : MAX_GAS_LIMIT;

      const requestBody: Record<string, unknown> = {
        is_nft: true,
        contract_id: contractId,
        crypto_currency_code: cryptoCurrencyCode,
        calldata,
        nft_data: nftData,
        estimated_gas_limit: gasLimit,
        api_key: TRANSAK_API_KEY[environment],
        theme_color: '0D0D0D',
        exchange_screen_title: exchangeScreenTitle,
        wallet_address: walletAddress,
        partner_order_id: partnerOrderId,
        referrer_domain: window.location.origin,
      };

      if (email) {
        requestBody.email = email;
      }

      if (excludeFiatCurrencies) {
        requestBody.exclude_fiat_currencies = excludeFiatCurrencies.join(',');
      }

      const widgetUrlResponse = await fetch(`${IMMUTABLE_API_BASE_URL[environment]}/checkout/v1/widget-url`, {
        method: 'POST',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!widgetUrlResponse.ok) {
        throw new Error('Failed to get widget URL');
      }

      const { url } = await widgetUrlResponse.json();
      return url;
    } catch {
      onError?.();
    }

    return '';
  }, [contractId, environment, transakParams, onError]);

  useEffect(() => {
    (async () => {
      const checkoutUrl = await getNFTCheckoutURL();
      setIframeSrc(checkoutUrl);
    })();
  }, []);

  return { iframeSrc };
};

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

const MAX_GAS_LIMIT = '30000000';

// TODO: Move to common config file inside Checkout SDK while refactoring onRamp
// TODO: Get transak config from checkout SDK
export const TRANSAK_WIDGET_BASE_URL = {
  [Environment.SANDBOX]: 'https://global-stg.transak.com',
  [Environment.PRODUCTION]: 'https://global.transak.com/',
};

export const TRANSAK_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://api-stg.transak.com',
  [Environment.PRODUCTION]: 'https://api.transak.com',
};

export const TRANSAK_ENVIRONMENT = {
  [Environment.SANDBOX]: 'STAGING',
  [Environment.PRODUCTION]: 'PRODUCTION',
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
          ...item,
          imageURL: sanitizeToLatin1(item.imageURL),
          nftName: sanitizeToLatin1(item.nftName),
        }));

      const gasLimit = estimatedGasLimit > 0 ? estimatedGasLimit : MAX_GAS_LIMIT;

      const params = {
        contractId,
        cryptoCurrencyCode,
        calldata,
        nftData,
        estimatedGasLimit: gasLimit.toString(),
      };

      // eslint-disable-next-line max-len
      const baseApiUrl = `${TRANSAK_API_BASE_URL[environment]}/cryptocoverage/api/v1/public/one-click-protocol/nft-transaction-id`;

      const response = await fetch(baseApiUrl, {
        method: 'POST',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to get NFT transaction ID');
      }

      const { id: nftTransactionId } = await response.json();

      const requestBody: Record<string, unknown> = {
        api_key: TRANSAK_API_KEY[environment],
        nft_transaction_id: nftTransactionId,
        theme_color: '0D0D0D',
        exchange_screen_title: exchangeScreenTitle,
        email,
        wallet_address: walletAddress,
        partner_order_id: partnerOrderId,
      };

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

import { Web3Provider } from '@ethersproject/providers';
import { Checkout, SaleItem, SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { useCallback, useState } from 'react';
import { useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import {
  SaleErrorTypes,
  SmartCheckoutError,
  SmartCheckoutErrorTypes,
} from '../types';
import {
  filterSmartCheckoutResult,
  getGasEstimate,
  getItemRequirements,
} from '../functions/smartCheckoutUtils';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: SaleItem[];
  amount: string;
  tokenAddress: string;
};

export const useSmartCheckout = ({
  checkout,
  provider,
  items,
  amount,
  tokenAddress,
}: UseSmartCheckoutInput) => {
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<
  SmartCheckoutResult | undefined
  >(undefined);
  const [smartCheckoutError, setError] = useState<
  SmartCheckoutError | undefined
  >(undefined);

  const { track } = useAnalytics();
  const setSmartCheckoutError = (error: SmartCheckoutError) => {
    track({
      screen: 'Error',
      action: 'Impression',
      userJourney: 'PrimarySale' as any,
      extras: {
        smartCheckoutError: error,
      },
    });
    setError(error);
  };

  const smartCheckout = useCallback(async () => {
    let finalSmartCheckoutResult: SmartCheckoutResult | undefined;
    try {
      const signer = provider?.getSigner();
      const spenderAddress = (await signer?.getAddress()) || '';
      const itemRequirements = getItemRequirements(
        amount,
        spenderAddress,
        tokenAddress,
      );
      const gasEstimate = getGasEstimate();
      const result = await checkout?.smartCheckout({
        provider: provider!,
        itemRequirements,
        transactionOrGasAmount: gasEstimate,
      });

      if (!result) {
        console.log("🚀 ~ smartCheckout result:", result); // eslint-disable-line
        throw new Error();
      }

      // TODO: Smart funding UI will be added later, meanwhile all insufficient
      // balances will be blocked and routed tru the add coins flow
      // FIXME: filtering smart checkout result won't be necessary
      // once smart checkout allows to skip gas checks and passing disabled funding routes
      finalSmartCheckoutResult = filterSmartCheckoutResult(
        { ...result },
        provider,
      );
      if (!finalSmartCheckoutResult.sufficient) {
        throw new Error(SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED);
      }

      setSmartCheckoutResult(finalSmartCheckoutResult);

      return result;
    } catch (error: any) {
      console.log("🚀 ~ setSmartCheckoutError:", error); // eslint-disable-line
      setSmartCheckoutError({
        type: SaleErrorTypes.SMART_CHECKOUT_ERROR,
        data: {
          error,
          transactionRequirements:
            finalSmartCheckoutResult?.transactionRequirements,
        },
      });
    }

    return undefined;
  }, [checkout, provider, items, amount, tokenAddress]);

  return {
    smartCheckout,
    smartCheckoutResult,
    smartCheckoutError,
  };
};

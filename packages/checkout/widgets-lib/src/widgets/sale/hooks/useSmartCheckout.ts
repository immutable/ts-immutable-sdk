import { Web3Provider } from '@ethersproject/providers';
import { Checkout, SaleItem, SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { useCallback, useState } from 'react';
import {
  SaleErrorTypes,
  SmartCheckoutError,
  SmartCheckoutErrorTypes,
} from '../types';
import {
  filterSmartCheckoutResult, getGasEstimate,
  getItemRequirements,
} from '../functions/smartCheckoutUtils';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: SaleItem[];
  tokenAddress: string;
};

export const useSmartCheckout = ({
  checkout,
  provider,
  items,
  
  tokenAddress,
}: UseSmartCheckoutInput) => {
  const amount = '0';
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<
  SmartCheckoutResult | undefined
  >(undefined);
  const [smartCheckoutError, setSmartCheckoutError] = useState<
  SmartCheckoutError | undefined
  >(undefined);

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

import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  SaleItem,
  SmartCheckoutResult,
} from '@imtbl/checkout-sdk';
import { useCallback, useState } from 'react';
import {
  SaleErrorTypes, SmartCheckoutError, SmartCheckoutErrorTypes,
} from '../types';
import {
  filterSmartCheckoutResult, getGasEstimate, getItemRequirements, isUserFractionalBalanceBlocked,
} from '../functions/smartCheckoutUtils';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: SaleItem[],
  amount: string,
  tokenAddress: string,
};

export const useSmartCheckout = ({
  checkout, provider, items, amount, tokenAddress,
}: UseSmartCheckoutInput) => {
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<SmartCheckoutResult | undefined>(
    undefined,
  );
  const [smartCheckoutError, setSmartCheckoutError] = useState<SmartCheckoutError | undefined>(
    undefined,
  );

  const smartCheckout = useCallback(async () => {
    try {
      const signer = provider?.getSigner();
      const spenderAddress = await signer?.getAddress() || '';
      console.log('🚀 ~ fractional check: spenderAddress:', spenderAddress); // eslint-disable-line

      const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
        spenderAddress,
        tokenAddress,
        amount,
        checkout,
        provider,
      );

      if (userFractionalBalanceBlocked) {
        throw new Error(SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED);
      }

      const itemRequirements = getItemRequirements(amount, spenderAddress, tokenAddress);
      const gasEstimate = getGasEstimate();
      console.log('🚀 ~ smartCheckout/itemRequirements:', itemRequirements, gasEstimate, !!provider); // eslint-disable-line
      const res = await checkout?.smartCheckout(
        {
          provider: provider!,
          itemRequirements,
          transactionOrGasAmount: gasEstimate,
        },
      );

      if (!res) {
        throw new Error();
      }
      const result = { ...res };
      const filteredSmartCheckoutResult = filterSmartCheckoutResult(result, provider);
      setSmartCheckoutResult(filteredSmartCheckoutResult);
      return result;
    } catch (err: any) {
      console.log('🚀 ~ setSmartCheckoutError:', err); // eslint-disable-line
      setSmartCheckoutError({
        type: SaleErrorTypes.SMART_CHECKOUT_ERROR,
        data: { error: err },
      });
    }
    return undefined;
  }, [checkout, provider, items, amount, tokenAddress]);

  return {
    smartCheckout, smartCheckoutResult, smartCheckoutError,
  };
};

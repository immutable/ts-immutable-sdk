import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  SmartCheckoutResult,
} from '@imtbl/checkout-sdk';
import { useCallback, useState } from 'react';
import { getGasEstimate, getItemRequirements, isUserFractionalBalanceBlocked } from '../functions/smartCheckoutUtils';
import {
  Item, SaleErrorTypes, SmartCheckoutError, SmartCheckoutErrorTypes,
} from '../types';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: Item[],
  amount: string,
  contractAddress: string,
};

export const useSmartCheckout = ({
  checkout, provider, items, amount, contractAddress,
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

      const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
        spenderAddress,
        contractAddress,
        amount,
        checkout,
        provider,
      );
      if (userFractionalBalanceBlocked) {
        throw new Error(SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED);
      }

      const itemRequirements = getItemRequirements(amount, spenderAddress, contractAddress);
      const gasEstimate = getGasEstimate();
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
      setSmartCheckoutResult(result);
      return result;
    } catch (err: any) {
      setSmartCheckoutError({
        type: SaleErrorTypes.SMART_CHECKOUT_ERROR,
        data: { error: err },
      });
    }
    return undefined;
  }, [checkout, provider, items, amount, contractAddress]);

  return {
    smartCheckout, smartCheckoutResult, smartCheckoutError,
  };
};

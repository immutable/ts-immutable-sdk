import { Web3Provider } from '@ethersproject/providers';
import { Checkout, SaleItem, SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { useCallback, useState } from 'react';
import {
  SaleErrorTypes,
  SmartCheckoutError,
  SmartCheckoutErrorTypes,
} from '../types';
import {
  filterSmartCheckoutResult,
  getGasEstimate,
  getItemRequirements,
  isUserFractionalBalanceBlocked,
} from '../functions/smartCheckoutUtils';
import { useCurrency } from './useCurrency';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: SaleItem[];
  amount: string;
  env: string;
  environmentId: string;
};

export const useSmartCheckout = ({
  checkout,
  provider,
  items,
  amount,
  env,
  environmentId,
}: UseSmartCheckoutInput) => {
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<
  SmartCheckoutResult | undefined
  >(undefined);
  const [smartCheckoutError, setSmartCheckoutError] = useState<
  SmartCheckoutError | undefined
  >(undefined);

  const { fetchCurrency } = useCurrency({
    env,
    environmentId,
  });

  const smartCheckout = useCallback(async () => {
    try {
      const signer = provider?.getSigner();
      const spenderAddress = (await signer?.getAddress()) || '';
      const fetchedTokenAddress = await fetchCurrency();

      if (!fetchedTokenAddress) return undefined;

      const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
        spenderAddress,
        fetchedTokenAddress[0].erc20_address,
        amount,
        checkout,
        provider,
      );
      if (userFractionalBalanceBlocked) {
        throw new Error(SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED);
      }

      const itemRequirements = getItemRequirements(
        amount,
        spenderAddress,
        fetchedTokenAddress[0].erc20_address,
      );
      const gasEstimate = getGasEstimate();
      const res = await checkout?.smartCheckout({
        provider: provider!,
        itemRequirements,
        transactionOrGasAmount: gasEstimate,
      });
      if (!res) {
        throw new Error();
      }
      const result = { ...res };
      const filteredSmartCheckoutResult = filterSmartCheckoutResult(result);
      setSmartCheckoutResult(filteredSmartCheckoutResult);
      return result;
    } catch (err: any) {
      setSmartCheckoutError({
        type: SaleErrorTypes.SMART_CHECKOUT_ERROR,
        data: { error: err },
      });
    }
    return undefined;
  }, [checkout, provider, items, amount]);

  return {
    smartCheckout,
    smartCheckoutResult,
    smartCheckoutError,
  };
};

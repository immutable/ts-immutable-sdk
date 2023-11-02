import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  ERC20ItemRequirement,
  GasAmount,
  GasTokenType,
  ItemType,
  SmartCheckoutResult,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { useCallback, useState } from 'react';
import { Item, SaleErrorTypes, SmartCheckoutError } from '../types';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: Item[],
  amount: string,
  contractAddress: string,
};

const MAX_GAS_LIMIT = '30000000';

const getItemRequirements = (amount: string, spenderAddress: string, contractAddress: string)
: ERC20ItemRequirement[] => [
  {
    type: ItemType.ERC20,
    contractAddress,
    spenderAddress,
    amount,
  },
];

const getGasEstimate = (): GasAmount => ({
  type: TransactionOrGasType.GAS,
  gasToken: {
    type: GasTokenType.NATIVE,
    limit: BigNumber.from(MAX_GAS_LIMIT),
  },
});

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

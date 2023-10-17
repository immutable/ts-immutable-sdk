/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
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
import { Item } from '../types';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: Item[],
  amount: string,
  spenderAddress: string,
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

  const smartCheckout = useCallback(async (callback?: (r?: SmartCheckoutResult) => void) => {
    if (!checkout || !provider) {
      return undefined;
    }

    const signer = provider.getSigner();
    const spenderAddress = await signer?.getAddress() || '';

    // ! Generate ItemRequirements
    const itemRequirements = getItemRequirements(amount, spenderAddress, contractAddress);
    // ! Generate GasEstimate
    const gasEstimate = getGasEstimate();

    try {
      const res = await checkout.smartCheckout(
        {
          provider,
          itemRequirements,
          transactionOrGasAmount: gasEstimate,
        },
      );

      setSmartCheckoutResult(res);
      return res;
    } catch (err: any) {
      throw new Error('Smart Checkout failed', err);
    }
  }, [checkout, provider, items, amount, contractAddress]);

  return {
    smartCheckout, smartCheckoutResult,
  };
};

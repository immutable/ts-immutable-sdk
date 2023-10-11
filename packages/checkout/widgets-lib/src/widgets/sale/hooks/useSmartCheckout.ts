/* eslint-disable no-console */
import {
  Checkout, GasAmount, ERC20ItemRequirement, ItemType, TransactionOrGasType, GasTokenType, SmartCheckoutResult,
} from '@imtbl/checkout-sdk';
import { useCallback, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, utils } from 'ethers';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getItemRequirements = (amount: string, spenderAddress: string, contractAddress: string)
: ERC20ItemRequirement[] => [
  {
    type: ItemType.ERC20,
    contractAddress: '0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8',
    spenderAddress,
    amount: utils.parseUnits(amount, 6).toString(),
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
  checkout, provider, items, amount, spenderAddress, contractAddress,
}: UseSmartCheckoutInput) => {
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<SmartCheckoutResult | undefined>(
    undefined,
  );

  const smartCheckout = useCallback(async () => {
    if (!checkout || !provider || !spenderAddress) {
      return undefined;
    }

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
      // eslint-disable-next-line no-console
      console.log('@@@@@@ useSmartCheckout SmartCheckout res', res);
      return res;
    } catch (err: any) {
      throw new Error('Smart Checkout failed', err);
    }
  }, [checkout, provider, items, amount, spenderAddress, contractAddress]);

  return {
    smartCheckout, smartCheckoutResult,
  };
};

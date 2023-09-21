import {
  Checkout, GasAmount, ItemRequirement, ItemType, TransactionOrGasType, GasTokenType,
} from '@imtbl/checkout-sdk';
import { useCallback } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, utils } from 'ethers';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
};

export type SmartCheckoutInput = {
  amount: string;
  spenderAddress: string;
  contractAddress: string;
};

const MAX_GAS_LIMIT = '30000000';

const getItemRequirements = (amount: string, spenderAddress: string, contractAddress: string): ItemRequirement[] => [
  {
    type: ItemType.ERC20,
    contractAddress,
    spenderAddress,
    amount: utils.parseUnits(amount, 6),
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
  checkout, provider,
}: UseSmartCheckoutInput) => {
  const smartCheckout = useCallback(async ({ amount, spenderAddress, contractAddress }: SmartCheckoutInput) => {
    if (!checkout) {
      throw new Error('missing checkout, please connect first');
    }
    if (!provider) {
      throw new Error('missing provider, please connect first');
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
      // eslint-disable-next-line no-console
      console.log('@@@@@@ useSmartCheckout SmartCheckout res', res);
      return res;
    } catch (err: any) {
      throw new Error('Smart Checkout failed', err);
    }
  }, [checkout, provider]);

  return {
    smartCheckout,
  };
};

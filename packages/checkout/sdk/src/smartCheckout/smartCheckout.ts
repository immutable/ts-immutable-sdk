import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  FulfilmentTransaction,
  GasAmount,
  ItemRequirement, SmartCheckoutResult, TransactionRequirementType,
} from '../types/smartCheckout';

export const smartCheckout = async (
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
  txnOrGasAmount: FulfilmentTransaction | GasAmount,
): Promise<SmartCheckoutResult> => {
  // eslint-disable-next-line no-console
  console.log(provider, itemRequirements, txnOrGasAmount);
  return {
    sufficient: true,
    transactionRequirements: [{
      type: TransactionRequirementType.GAS,
      sufficient: true,
      required: {
        balance: BigNumber.from(0),
        formattedBalance: '0',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          address: '0x0',
          decimals: 18,
        },
      },
      current: {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          address: '0x0',
          decimals: 18,
        },
      },
    }],
  };
};

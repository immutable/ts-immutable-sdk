import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  FulfilmentTransaction,
  GasAmount,
  ItemRequirement, SmartCheckoutResult, TransactionRequirementType,
} from '../types/smartCheckout';
import { itemAggregator } from './itemAggregator';
import { hasERC20Allowances } from './allowance';

export const smartCheckout = async (
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
  transactionOrGasAmount: FulfilmentTransaction | GasAmount,
): Promise<SmartCheckoutResult> => {
  // eslint-disable-next-line no-console
  console.log(provider, itemRequirements, transactionOrGasAmount);
  const aggregatedItems = itemAggregator(itemRequirements);
  // eslint-disable-next-line no-console
  console.log(aggregatedItems);
  const erc20Allowances = await hasERC20Allowances(provider, aggregatedItems);
  // eslint-disable-next-line no-console
  console.log(erc20Allowances);

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

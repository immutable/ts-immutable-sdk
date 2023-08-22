import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  FulfilmentTransaction,
  GasAmount,
  ItemRequirement, SmartCheckoutResult, TransactionRequirementType,
} from '../types/smartCheckout';
import { itemAggregator } from './itemAggregator';
import {
  hasERC20Allowances,
  hasERC721Allowances,
} from './allowance';

export const smartCheckout = async (
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
  transactionOrGasAmount: FulfilmentTransaction | GasAmount,
): Promise<SmartCheckoutResult> => {
  // eslint-disable-next-line no-console
  console.log(provider, itemRequirements, transactionOrGasAmount);

  const ownerAddress = await provider.getSigner().getAddress();
  const aggregatedItems = itemAggregator(itemRequirements);
  const erc20Allowances = await hasERC20Allowances(provider, ownerAddress, aggregatedItems);
  const erc721Allowances = await hasERC721Allowances(provider, ownerAddress, aggregatedItems);

  // eslint-disable-next-line no-console
  console.log('ERC20 Allowances', erc20Allowances);
  // eslint-disable-next-line no-console
  console.log('ERC721 Allowances', erc721Allowances);

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

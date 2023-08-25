/* eslint-disable arrow-body-style */
import { BigNumber, utils } from 'ethers';
import {
  DEFAULT_TOKEN_DECIMALS,
  ERC20Item,
  ERC721Item,
  IMX_ADDRESS_ZKEVM,
  ItemType,
  NativeItem,
  TokenInfo,
} from '../../types';
import {
  BalanceERC721Requirement,
  BalanceERC721Result,
  BalanceRequirement,
  BalanceResult,
  BalanceTokenResult,
} from './types';

/**
 * Gets the balance requirement with delta for an ERC721 requirement.
 */
export const getERC721BalanceRequirement = (
  itemRequirement: ERC721Item,
  balances: BalanceResult[],
) : BalanceERC721Requirement => {
  const requiredBalance = BigNumber.from(1);

  // Find the requirements related balance
  const itemBalanceResult = balances.find((balance) => {
    const balanceERC721Result = balance as BalanceERC721Result;
    return balanceERC721Result.contractAddress === itemRequirement.contractAddress
      && balanceERC721Result.id === itemRequirement.id;
  });

  // Calculate the balance delta
  const sufficient = (requiredBalance.isNegative() || requiredBalance.isZero())
    || (itemBalanceResult?.balance.gte(requiredBalance) ?? false);
  const delta = requiredBalance.sub(itemBalanceResult?.balance ?? BigNumber.from(0));
  let erc721BalanceResult = itemBalanceResult as BalanceERC721Result;
  if (!erc721BalanceResult) {
    erc721BalanceResult = {
      balance: BigNumber.from(0),
      formattedBalance: '0',
      contractAddress: itemRequirement.contractAddress,
      id: itemRequirement.id,
    };
  }
  return {
    sufficient,
    type: itemRequirement.type,
    delta: {
      balance: delta,
      formattedBalance: delta.toString(),
    },
    current: erc721BalanceResult as BalanceERC721Result,
    required: {
      ...erc721BalanceResult,
      balance: BigNumber.from(1),
      formattedBalance: '1',
    } as BalanceERC721Result,
  };
};

/**
 * Gets the balance requirement for a NATIVE or ERC20 requirement.
 */
export const getTokenBalanceRequirement = (
  itemRequirement: ERC20Item | NativeItem,
  balances: BalanceResult[],
) : BalanceRequirement => {
  let itemBalanceResult: BalanceResult | undefined;

  // Get the requirements related balance
  if (itemRequirement.type === ItemType.ERC20) {
    itemBalanceResult = balances.find((balance) => {
      return (balance as BalanceTokenResult).token?.address === itemRequirement.contractAddress;
    });
  } else if (itemRequirement.type === ItemType.NATIVE) {
    itemBalanceResult = balances.find((balance) => {
      return (balance as BalanceTokenResult).token?.address === IMX_ADDRESS_ZKEVM;
    });
  }

  // Calculate the balance delta
  const requiredBalance: BigNumber = itemRequirement.amount;
  const sufficient = (requiredBalance.isNegative() || requiredBalance.isZero())
    || (itemBalanceResult?.balance.gte(requiredBalance) ?? false);
  const delta = requiredBalance.sub(itemBalanceResult?.balance ?? BigNumber.from(0));
  let decimals = DEFAULT_TOKEN_DECIMALS;
  if (itemBalanceResult) {
    decimals = (itemBalanceResult as BalanceTokenResult).token?.decimals ?? DEFAULT_TOKEN_DECIMALS;
  }

  let tokenBalanceResult = itemBalanceResult as BalanceTokenResult;
  if (itemRequirement.type === ItemType.NATIVE) {
    // No token balance so mark as zero native
    if (!tokenBalanceResult) {
      tokenBalanceResult = {
        balance: BigNumber.from(0),
        formattedBalance: '0',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: DEFAULT_TOKEN_DECIMALS,
          address: IMX_ADDRESS_ZKEVM,
        },
      };
    }
    return {
      sufficient,
      type: ItemType.NATIVE,
      delta: {
        balance: delta,
        formattedBalance: utils.formatUnits(delta, decimals),
      },
      current: tokenBalanceResult,
      required: {
        ...tokenBalanceResult,
        balance: BigNumber.from(itemRequirement.amount),
        formattedBalance: utils.formatUnits(itemRequirement.amount, decimals),
      },
    } as any;
  }

  // No token balance so mark as zero
  if (!tokenBalanceResult) {
    tokenBalanceResult = {
      balance: BigNumber.from(0),
      formattedBalance: '0',
      token: {
        address: itemRequirement.contractAddress,
      } as TokenInfo,
    };
  }
  return {
    sufficient,
    type: ItemType.ERC20,
    delta: {
      balance: delta,
      formattedBalance: utils.formatUnits(delta, decimals),
    },
    current: tokenBalanceResult,
    required: {
      ...tokenBalanceResult,
      balance: BigNumber.from(itemRequirement.amount),
      formattedBalance: utils.formatUnits(itemRequirement.amount, decimals),
    },
  };
};

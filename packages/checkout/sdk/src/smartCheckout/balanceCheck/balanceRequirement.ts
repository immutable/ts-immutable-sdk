/* eslint-disable arrow-body-style */
import { BigNumber, utils } from 'ethers';
import {
  DEFAULT_TOKEN_DECIMALS,
  ERC20Item,
  ERC721Balance,
  ERC721Item,
  IMX_ADDRESS_ZKEVM, ItemBalance, ItemRequirement,
  ItemType,
  NativeItem,
  TokenBalance,
  TokenInfo,
} from '../../types';
import {
  BalanceERC20Requirement,
  BalanceERC721Requirement,
  BalanceNativeRequirement,
} from './types';

export const getTokensFromRequirements = (itemRequirements: ItemRequirement[]): TokenInfo[] => itemRequirements
  .map((itemRequirement) => {
    if (itemRequirement.type === ItemType.NATIVE) {
      return {
        address: IMX_ADDRESS_ZKEVM,
      } as TokenInfo;
    }

    return {
      address: itemRequirement.contractAddress,
    } as TokenInfo;
  });

/**
 * Gets the balance requirement with delta for an ERC721 requirement.
 */
export const getERC721BalanceRequirement = (
  itemRequirement: ERC721Item,
  balances: ItemBalance[],
) : BalanceERC721Requirement => {
  const requiredBalance = BigNumber.from(1);

  // Find the requirements related balance
  const itemBalanceResult = balances.find((balance) => {
    const balanceERC721Result = balance as ERC721Balance;
    return balanceERC721Result.contractAddress === itemRequirement.contractAddress
      && balanceERC721Result.id === itemRequirement.id;
  });

  // Calculate the balance delta
  const sufficient = (requiredBalance.isNegative() || requiredBalance.isZero())
    || (itemBalanceResult?.balance.gte(requiredBalance) ?? false);
  const delta = requiredBalance.sub(itemBalanceResult?.balance ?? BigNumber.from(0));
  let erc721BalanceResult = itemBalanceResult as ERC721Balance;
  if (!erc721BalanceResult) {
    erc721BalanceResult = {
      type: ItemType.ERC721,
      balance: BigNumber.from(0),
      formattedBalance: '0',
      contractAddress: itemRequirement.contractAddress,
      id: itemRequirement.id,
    };
  }
  return {
    sufficient,
    type: ItemType.ERC721,
    delta: {
      balance: delta,
      formattedBalance: delta.toString(),
    },
    current: erc721BalanceResult,
    required: {
      ...erc721BalanceResult,
      balance: BigNumber.from(1),
      formattedBalance: '1',
    },
  };
};

/**
 * Gets the balance requirement for a NATIVE or ERC20 requirement.
 */
export const getTokenBalanceRequirement = (
  itemRequirement: ERC20Item | NativeItem,
  balances: ItemBalance[],
) : BalanceNativeRequirement | BalanceERC20Requirement => {
  let itemBalanceResult: ItemBalance | undefined;

  // Get the requirements related balance
  if (itemRequirement.type === ItemType.ERC20) {
    itemBalanceResult = balances.find((balance) => {
      return (balance as TokenBalance).token?.address === itemRequirement.contractAddress;
    });
  } else if (itemRequirement.type === ItemType.NATIVE) {
    itemBalanceResult = balances.find((balance) => {
      return !('address' in (balance as TokenBalance).token)
        || (balance as TokenBalance).token?.address === IMX_ADDRESS_ZKEVM;
    });
  }

  // Calculate the balance delta
  const requiredBalance: BigNumber = itemRequirement.amount;
  const sufficient = (requiredBalance.isNegative() || requiredBalance.isZero())
    || (itemBalanceResult?.balance.gte(requiredBalance) ?? false);

  const delta = requiredBalance.sub(itemBalanceResult?.balance ?? BigNumber.from(0));
  let name = '';
  let symbol = '';
  let decimals = DEFAULT_TOKEN_DECIMALS;
  if (itemBalanceResult) {
    decimals = (itemBalanceResult as TokenBalance).token?.decimals ?? DEFAULT_TOKEN_DECIMALS;
    name = (itemBalanceResult as TokenBalance).token.name;
    symbol = (itemBalanceResult as TokenBalance).token.symbol;
  }

  let tokenBalanceResult = itemBalanceResult as TokenBalance;
  if (itemRequirement.type === ItemType.NATIVE) {
    // No token balance so mark as zero native
    if (!tokenBalanceResult) {
      tokenBalanceResult = {
        type: ItemType.NATIVE,
        balance: BigNumber.from(0),
        formattedBalance: '0',
        token: {
          name,
          symbol,
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
      current: {
        ...tokenBalanceResult,
        type: ItemType.NATIVE,
      },
      required: {
        ...tokenBalanceResult,
        type: ItemType.NATIVE,
        balance: BigNumber.from(itemRequirement.amount),
        formattedBalance: utils.formatUnits(itemRequirement.amount, decimals),
      },
    };
  }

  // No token balance so mark as zero
  if (!tokenBalanceResult) {
    tokenBalanceResult = {
      type: itemRequirement.type,
      balance: BigNumber.from(0),
      formattedBalance: '0',
      token: {
        name,
        symbol,
        address: itemRequirement.contractAddress,
        decimals,
      },
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

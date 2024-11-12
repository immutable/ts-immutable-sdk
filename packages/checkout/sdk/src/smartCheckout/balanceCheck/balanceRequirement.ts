/* eslint-disable arrow-body-style */
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import {
  ERC20Item,
  ERC721Balance,
  ERC721Item,
  ItemBalance,
  ItemRequirement,
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
import {
  DEFAULT_TOKEN_DECIMALS,
  ERC20ABI,
  NATIVE,
  ZKEVM_NATIVE_TOKEN,
} from '../../env';
import { isNativeToken } from '../../tokens';
import { isMatchingAddress } from '../../utils/utils';

export const getTokensFromRequirements = (
  itemRequirements: ItemRequirement[],
): TokenInfo[] => itemRequirements.map((itemRequirement) => {
  switch (itemRequirement.type) {
    case ItemType.ERC20:
      return {
        address: itemRequirement.tokenAddress,
      } as TokenInfo;
    case ItemType.NATIVE:
      return {
        address: NATIVE,
      } as TokenInfo;
    case ItemType.ERC721:
    default:
      return {
        address: itemRequirement.contractAddress,
      } as TokenInfo;
  }
});

/**
 * Gets the balance requirement with delta for an ERC721 requirement.
 */
export const getERC721BalanceRequirement = (
  itemRequirement: ERC721Item,
  balances: ItemBalance[],
): BalanceERC721Requirement => {
  const requiredBalance = BigInt(1);

  // Find the requirements related balance
  const itemBalanceResult = balances.find((balance) => {
    const balanceERC721Result = balance as ERC721Balance;
    return (
      isMatchingAddress(
        balanceERC721Result.contractAddress,
        itemRequirement.contractAddress,
      ) && balanceERC721Result.id === itemRequirement.id
    );
  });

  // Calculate the balance delta
  const sufficient = requiredBalance < 0
    || requiredBalance === 0n
    || (itemBalanceResult && itemBalanceResult.balance >= requiredBalance);
  const delta = requiredBalance - (itemBalanceResult?.balance ?? BigInt(0));
  let erc721BalanceResult = itemBalanceResult as ERC721Balance;
  if (!erc721BalanceResult) {
    erc721BalanceResult = {
      type: ItemType.ERC721,
      balance: BigInt(0),
      formattedBalance: '0',
      contractAddress: itemRequirement.contractAddress,
      id: itemRequirement.id,
    };
  }
  return {
    sufficient: sufficient ?? false,
    type: ItemType.ERC721,
    delta: {
      balance: delta,
      formattedBalance: delta.toString(),
    },
    current: erc721BalanceResult,
    required: {
      ...erc721BalanceResult,
      balance: BigInt(1),
      formattedBalance: '1',
    },
    isFee: false,
  };
};

export const getTokenFromBalances = (
  itemRequirement: ERC20Item | NativeItem,
  balances: ItemBalance[],
): TokenBalance | undefined => {
  if (itemRequirement.type === ItemType.ERC20) {
    return balances.find((balance) => {
      return isMatchingAddress(
        (balance as TokenBalance).token?.address,
        itemRequirement.tokenAddress,
      );
    }) as TokenBalance;
  }

  return balances.find((balance) => {
    return isNativeToken((balance as TokenBalance).token?.address);
  }) as TokenBalance;
};

type TokensInfoMap = {
  [key: string]: TokenInfo;
};

export const getTokensInfo = async (
  itemRequirements: Array<ERC20Item | NativeItem>,
  balances: ItemBalance[],
  provider: BrowserProvider,
): Promise<TokensInfoMap> => {
  const tokensInfo: TokensInfoMap = {};

  for (const itemRequirement of itemRequirements) {
    if (itemRequirement.type === ItemType.NATIVE) {
      tokensInfo[NATIVE] = ZKEVM_NATIVE_TOKEN;
      continue;
    }

    const tokenBalance = getTokenFromBalances(itemRequirement, balances);

    let address = tokenBalance?.token.address ?? '';
    let name = tokenBalance?.token.name ?? '';
    let symbol = tokenBalance?.token.symbol ?? '';
    let decimals = tokenBalance?.token.decimals ?? DEFAULT_TOKEN_DECIMALS;

    if (!tokenBalance && itemRequirement.type === ItemType.ERC20) {
      address = itemRequirement.tokenAddress;

      if (address.toLowerCase() in tokensInfo) {
        continue;
      }

      // Missing item balance so we need to query contract
      try {
        const contract = new Contract(
          itemRequirement.tokenAddress,
          JSON.stringify(ERC20ABI),
          provider,
        );
        // eslint-disable-next-line no-await-in-loop
        const [contractName, contractSymbol, contractDecimals] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
        ]);
        address = itemRequirement.tokenAddress;
        decimals = contractDecimals;
        name = contractName;
        symbol = contractSymbol;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to query contract information',
          itemRequirement.tokenAddress,
        );
      }
    }

    tokensInfo[address.toLowerCase()] = {
      address,
      name,
      symbol,
      decimals,
    };
  }

  return tokensInfo;
};

/**
 * Gets the balance requirement for a NATIVE or ERC20 requirement.
 */
export const getTokenBalanceRequirement = (
  itemRequirement: ERC20Item | NativeItem,
  balances: ItemBalance[],
  token: TokenInfo,
): BalanceNativeRequirement | BalanceERC20Requirement => {
  let tokenBalance = getTokenFromBalances(itemRequirement, balances);

  const requiredBalance: bigint = itemRequirement.amount;

  // Calculate the balance delta
  const sufficient = requiredBalance < 0
    || requiredBalance === 0n
    || (tokenBalance && tokenBalance?.balance >= requiredBalance);

  const delta = requiredBalance - (tokenBalance?.balance ?? BigInt(0));

  if (itemRequirement.type === ItemType.NATIVE) {
    // No token balance so mark as zero native
    if (!tokenBalance) {
      tokenBalance = {
        type: ItemType.NATIVE,
        balance: BigInt(0),
        formattedBalance: '0',
        token,
      };
    }

    return {
      sufficient: sufficient ?? false,
      type: ItemType.NATIVE,
      delta: {
        balance: delta,
        formattedBalance: formatUnits(delta, token.decimals),
      },
      current: {
        ...tokenBalance,
        type: ItemType.NATIVE,
        token,
      },
      required: {
        ...tokenBalance,
        type: ItemType.NATIVE,
        balance: BigInt(itemRequirement.amount),
        formattedBalance: formatUnits(itemRequirement.amount, token.decimals),
        token,
      },
      isFee: itemRequirement.isFee,
    };
  }

  // No token balance so mark as zero
  if (!tokenBalance) {
    tokenBalance = {
      type: itemRequirement.type,
      balance: BigInt(0),
      formattedBalance: '0',
      token,
    };
  }

  return {
    sufficient: sufficient ?? false,
    type: ItemType.ERC20,
    delta: {
      balance: delta,
      formattedBalance: formatUnits(delta, token.decimals),
    },
    current: {
      ...tokenBalance,
      token,
    },
    required: {
      ...tokenBalance,
      token,
      balance: BigInt(itemRequirement.amount),
      formattedBalance: formatUnits(itemRequirement.amount, token.decimals),
    },
    isFee: itemRequirement.isFee,
  };
};

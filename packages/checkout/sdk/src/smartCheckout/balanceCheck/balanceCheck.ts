/* eslint-disable arrow-body-style */
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import {
  ERC721Balance,
  ItemBalance,
  TokenBalance,
  ERC721ABI,
  ERC721Item,
  ItemRequirement,
  ItemType,
  TokenInfo,
  NativeItem,
  ERC20Item,
} from '../../types';
import { getBalances } from '../../balances';
import { CheckoutConfiguration } from '../../config';
import {
  BalanceCheckResult,
  BalanceRequirement,
} from './types';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { balanceAggregator } from '../aggregators/balanceAggregator';
import {
  getERC721BalanceRequirement,
  getTokenBalanceRequirement,
  getTokensFromRequirements,
} from './balanceRequirement';

/**
 * Gets the balances for all NATIVE and ERC20 balance requirements.
 */
const getTokenBalances = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
) : Promise<ItemBalance[]> => {
  let tokenBalances: TokenBalance[] = [];

  try {
    const tokenList: TokenInfo[] = getTokensFromRequirements(itemRequirements);
    const { balances } = await getBalances(config, provider, ownerAddress, tokenList);
    tokenBalances = [
      ...balances.map((balance) => balance as TokenBalance),
    ];
  } catch (error: any) {
    throw new CheckoutError(
      'Failed to get balances',
      CheckoutErrorType.GET_BALANCE_ERROR,
    );
  }

  return tokenBalances;
};

/**
 * Gets the balances for all ERC721 balance requirements.
 */
const getERC721Balances = async (
  provider: Web3Provider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
) : Promise<ItemBalance[]> => {
  const erc721Balances: ERC721Balance[] = [];

  // Setup maps to be able to link data back to the associated promises
  const erc721s = new Map<string, ItemRequirement>();
  const erc721OwnershipPromises = new Map<string, Promise<string>>();
  itemRequirements
    .forEach((itemRequirement) => {
      if (itemRequirement.type !== ItemType.ERC721) return;
      const contract = new Contract(
        itemRequirement.contractAddress,
        JSON.stringify(ERC721ABI),
        provider,
      );

      erc721s.set(itemRequirement.contractAddress, itemRequirement);
      erc721OwnershipPromises.set(itemRequirement.contractAddress, contract.ownerOf(itemRequirement.id));
    });

  try {
    // Convert ERC721 ownership into a balance result
    const erc721Owners = await Promise.all(erc721OwnershipPromises.values());
    const erc721OwnersPromiseIds = Array.from(erc721OwnershipPromises.keys());
    erc721Owners.forEach((erc721OwnerAddress, index) => {
      const itemRequirement = erc721s.get(erc721OwnersPromiseIds[index]);
      let itemCount = 0;
      if (itemRequirement && ownerAddress === erc721OwnerAddress) {
        itemCount = 1;
      }
      erc721Balances.push({
        type: ItemType.ERC721,
        balance: BigNumber.from(itemCount),
        formattedBalance: itemCount.toString(),
        contractAddress: (itemRequirement as ERC721Item).contractAddress,
        id: (itemRequirement as ERC721Item).id,
      });
    });
  } catch (error: any) {
    throw new CheckoutError(
      'Failed to get ERC721 balances',
      CheckoutErrorType.GET_ERC721_BALANCE_ERROR,
    );
  }

  return erc721Balances;
};

/**
 * Checks the item requirements against the owner balances.
 */
export const balanceCheck = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
) : Promise<BalanceCheckResult> => {
  const aggregatedItems = balanceAggregator(itemRequirements);
  if (aggregatedItems.filter((itemRequirement) => {
    return itemRequirement.type !== ItemType.ERC721
      && itemRequirement.type !== ItemType.ERC20
      && itemRequirement.type !== ItemType.NATIVE;
  }).length > 0) {
    throw new CheckoutError(
      'Unsupported item requirement balance check',
      CheckoutErrorType.UNSUPPORTED_BALANCE_REQUIREMENT_ERROR,
    );
  }

  // Get all ERC20 and NATIVE balances
  const currentBalances: Promise<ItemBalance[]>[] = [];
  const tokenItemRequirements: ItemRequirement[] = aggregatedItems
    .filter((itemRequirement) => itemRequirement.type === ItemType.ERC20 || itemRequirement.type === ItemType.NATIVE);
  if (tokenItemRequirements.length > 0) {
    currentBalances.push(getTokenBalances(config, provider, ownerAddress, aggregatedItems));
  }

  // Get all ERC721 balances
  const erc721ItemRequirements: ItemRequirement[] = aggregatedItems
    .filter((itemRequirement) => itemRequirement.type === ItemType.ERC721);
  if (erc721ItemRequirements.length > 0) {
    currentBalances.push(getERC721Balances(provider, ownerAddress, aggregatedItems));
  }

  // Wait for all balances and calculate the requirements
  const balanceRequirements: BalanceRequirement[] = await Promise.all(currentBalances).then((balances) => {
    const requirements: BalanceRequirement[] = [];
    if (balances.length > 1 || tokenItemRequirements.length > 0) {
      const tokenBalances = balances[0];
      tokenItemRequirements.forEach((tokenItemRequirement) => {
        requirements.push(getTokenBalanceRequirement(tokenItemRequirement as (NativeItem | ERC20Item), tokenBalances));
      });
      if (erc721ItemRequirements.length > 0) {
        const erc721Balances = balances[1];
        erc721ItemRequirements.forEach((erc721ItemRequirement) => {
          requirements.push(getERC721BalanceRequirement(erc721ItemRequirement as ERC721Item, erc721Balances));
        });
      }
    } else if (erc721ItemRequirements.length > 0) {
      // Only erc721
      const erc721Balances = balances[0];
      erc721ItemRequirements.forEach((erc721ItemRequirement) => {
        requirements.push(getERC721BalanceRequirement(erc721ItemRequirement as ERC721Item, erc721Balances));
      });
    }
    return requirements;
  });

  const sufficient = balanceRequirements.reduce((acc, balanceRequirement) => {
    return acc && balanceRequirement.sufficient;
  }, true);
  return {
    sufficient,
    balanceRequirements,
  };
};

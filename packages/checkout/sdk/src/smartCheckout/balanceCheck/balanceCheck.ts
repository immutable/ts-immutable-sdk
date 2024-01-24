import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
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
import { getAllBalances } from '../../balances';
import { CheckoutConfiguration, getL2ChainId } from '../../config';
import { BalanceCheckResult, BalanceRequirement } from './types';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { balanceAggregator } from '../aggregators/balanceAggregator';
import {
  getERC721BalanceRequirement,
  getTokenBalanceRequirement,
  getTokensFromRequirements,
} from './balanceRequirement';
import { ERC721ABI, NATIVE } from '../../env';
import { isMatchingAddress } from '../../utils/utils';

/**
 * Gets the balances for all NATIVE and ERC20 balance requirements.
 */
const getTokenBalances = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
  forceFetch: boolean = false,
) : Promise<ItemBalance[]> => {
  try {
    const tokenMap = new Map<string, TokenInfo>();
    getTokensFromRequirements(itemRequirements).forEach(
      (item) => {
        if (!item.address) return;
        tokenMap.set(item.address.toLocaleLowerCase(), item);
      },
    );
    const { balances } = await getAllBalances(config, provider, ownerAddress, getL2ChainId(config), forceFetch);
    return balances.filter(
      (balance) => tokenMap.get((balance.token.address || NATIVE).toLocaleLowerCase()),
    ) as TokenBalance[];
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get balances',
      CheckoutErrorType.GET_BALANCE_ERROR,
      { error: err },
    );
  }
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
      if (itemRequirement && isMatchingAddress(ownerAddress, erc721OwnerAddress)) {
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
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get ERC721 balances',
      CheckoutErrorType.GET_ERC721_BALANCE_ERROR,
      { error: err },
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
  forceFetch: boolean = false,
) : Promise<BalanceCheckResult> => {
  const aggregatedItems = balanceAggregator(itemRequirements);

  const requiredToken: ItemRequirement[] = [];
  const requiredERC721: ItemRequirement[] = [];

  aggregatedItems.forEach((item) => {
    switch (item.type) {
      case ItemType.ERC20:
      case ItemType.NATIVE:
        requiredToken.push(item);
        break;
      case ItemType.ERC721:
        requiredERC721.push(item);
        break;
      default:
    }
  });

  if (requiredERC721.length === 0 && requiredToken.length === 0) {
    throw new CheckoutError(
      'Unsupported item requirement balance check',
      CheckoutErrorType.UNSUPPORTED_BALANCE_REQUIREMENT_ERROR,
    );
  }

  // Get all ERC20 and NATIVE balances
  const balancePromises: Promise<ItemBalance[]>[] = [];
  if (requiredToken.length > 0) {
    balancePromises.push(getTokenBalances(config, provider, ownerAddress, aggregatedItems, forceFetch));
  }

  // Get all ERC721 balances
  if (requiredERC721.length > 0) {
    balancePromises.push(getERC721Balances(provider, ownerAddress, aggregatedItems));
  }

  // Wait for all balances and calculate the requirements
  const promisesResponses = await Promise.all(balancePromises);
  const balanceRequirements: BalanceRequirement[] = [];

  // Get all ERC20 and NATIVE balances
  if (requiredToken.length > 0 && promisesResponses.length > 0) {
    const result = promisesResponses.shift();
    if (result) {
      requiredToken.forEach((item) => {
        balanceRequirements.push(getTokenBalanceRequirement(item as (NativeItem | ERC20Item), result));
      });
    }
  }

  // Get all ERC721 balances
  if (requiredERC721.length > 0 && promisesResponses.length > 0) {
    const result = promisesResponses.shift();
    if (result) {
      requiredERC721.forEach((item) => {
        balanceRequirements.push(getERC721BalanceRequirement(item as (ERC721Item), result));
      });
    }
  }

  // Find if there are any requirements that aren't sufficient.
  // If there is not item with sufficient === false then the requirements
  // are satisfied.
  const sufficient = balanceRequirements.find((req) => req.sufficient === false) === undefined;

  return {
    sufficient,
    balanceRequirements,
  };
};

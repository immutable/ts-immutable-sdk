import { Web3Provider } from '@ethersproject/providers';
import {
  ERC20Item,
  NativeItem,
  Orderbook,
  PrepareListingResponse,
  constants,
} from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import { BuyToken, SellResult } from '../../types/sell';
import {
  ERC721Item,
  GasTokenType,
  ItemType,
  TransactionOrGasType,
} from '../../types';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { smartCheckout } from '../smartCheckout';
import { executeTransactions, getUnsignedTransactions } from '../transactions';

export const getERC721Requirement = (
  id: string,
  contractAddress: string,
  spenderAddress: string,
):ERC721Item => ({
  type: ItemType.ERC721,
  id,
  contractAddress,
  spenderAddress,
});

export const getBuyToken = (
  buyToken: BuyToken,
): ERC20Item | NativeItem => {
  if (buyToken.type === ItemType.NATIVE) {
    return {
      type: ItemType.NATIVE,
      amount: buyToken.amount.toString(),
    };
  }

  return {
    type: ItemType.ERC20,
    amount: buyToken.amount.toString(),
    contractAddress: buyToken.contractAddress,
  };
};

export const sell = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  id: string,
  contractAddress: string,
  buyToken: BuyToken,
  shouldExecuteTransactions?: boolean,
): Promise<SellResult> => {
  let orderbook: Orderbook;
  let listing: PrepareListingResponse;
  let spenderAddress = '';

  try {
    const walletAddress = await provider.getSigner().getAddress();
    orderbook = await instance.createOrderbookInstance(config);
    const { seaportContractAddress } = orderbook.config();
    spenderAddress = seaportContractAddress;
    listing = await orderbook.prepareListing({
      makerAddress: walletAddress,
      buy: getBuyToken(buyToken),
      sell: {
        type: ItemType.ERC721,
        contractAddress,
        tokenId: id,
      },
    });
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while preparing the listing',
      CheckoutErrorType.PREPARE_ORDER_LISTING_ERROR,
      {
        message: err.message,
        id,
        collectionAddress: contractAddress,
      },
    );
  }

  const itemRequirements = [
    getERC721Requirement(id, contractAddress, spenderAddress),
  ];

  const smartCheckoutResult = await smartCheckout(
    config,
    provider,
    itemRequirements,
    {
      type: TransactionOrGasType.GAS,
      gasToken: {
        type: GasTokenType.NATIVE,
        limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
      },
    },
  );

  if (smartCheckoutResult.sufficient) {
    const unsignedTransactions = await getUnsignedTransactions(listing.actions);
    if (shouldExecuteTransactions) {
      await executeTransactions(provider, unsignedTransactions);
      return {
        smartCheckoutResult,
      };
    }
    return {
      smartCheckoutResult,
      transactions: unsignedTransactions,
    };
  }

  return {
    smartCheckoutResult,
  };
};

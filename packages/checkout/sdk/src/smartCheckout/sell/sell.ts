/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import {
  Action,
  ActionType,
  ERC20Item, NativeItem, Orderbook, PrepareListingResponse, SignablePurpose, TransactionPurpose, constants,
} from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import { BuyToken, SellResult } from '../../types/sell';
import {
  ERC721Item,
  GasTokenType,
  IMX_ADDRESS_ZKEVM, ItemType, TokenInfo, TransactionOrGasType,
} from '../../types';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { smartCheckout } from '../smartCheckout';

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
  token: TokenInfo,
  amount: string,
): ERC20Item | NativeItem => {
  if (
    token.address === IMX_ADDRESS_ZKEVM
    || token.address === ''
    || token.address === undefined) {
    return {
      type: ItemType.NATIVE,
      amount,
    };
  }

  return {
    type: ItemType.ERC20,
    amount,
    contractAddress: token.address,
  };
};

export const sell = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  id: string,
  contractAddress: string,
  buyToken: BuyToken,
): Promise<SellResult> => {
  let orderbook: Orderbook;
  let listing: PrepareListingResponse;
  let spenderAddress = '';

  const walletAddress = await provider.getSigner().getAddress();

  try {
    orderbook = await instance.createOrderbookInstance(config);
    const { seaportContractAddress } = orderbook.config();
    spenderAddress = seaportContractAddress;
    listing = await orderbook.prepareListing({
      makerAddress: walletAddress,
      buy: buyToken,
      sell: {
        type: ItemType.ERC721,
        contractAddress,
        tokenId: id,
      },
    });
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while fulfilling the listing',
      CheckoutErrorType.GET_ORDER_LISTING_ERROR,
      {
        message: err.message,
      },
    );
  }

  const itemRequirements = [
    getERC721Requirement(id, contractAddress, spenderAddress),
  ];

  // eslint-disable-next-line no-console
  console.log(listing); // TODO: Get order signature, provider.getSigner()._signTypedData to sign

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

  // eslint-disable-next-line no-console
  console.log('transactionRequirements', smartCheckoutResult);

  return {
    itemRequirements,
    gasToken: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(constants.estimatedFulfillmentGasGwei),
    },
    smartCheckoutResult,
  };
};

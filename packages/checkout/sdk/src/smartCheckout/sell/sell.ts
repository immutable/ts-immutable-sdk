import { Web3Provider } from '@ethersproject/providers';
import {
  CreateListingParams,
  ERC20Item,
  NativeItem,
  Orderbook,
  PrepareListingResponse,
  constants,
} from '@imtbl/orderbook';
import { BigNumber, Contract } from 'ethers';
import {
  BuyToken, SellOrder, SellResult, SellStatusType,
} from '../../types/sell';
import {
  ERC721Item,
  GasTokenType,
  ItemType,
  TransactionOrGasType,
  ERC20ABI,
} from '../../types';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { smartCheckout } from '../smartCheckout';
import {
  getUnsignedTransactions,
  getUnsignedMessage,
  signApprovalTransactions,
  signMessage,
} from '../actions';
import { SignTransactionStatusType } from '../actions/types';
import { calculateFees } from '../fees/fees';

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
  decimals: number = 18,
): ERC20Item | NativeItem => {
  const bnAmount = BigNumber.from(buyToken.amount).mul(BigNumber.from(10).pow(decimals));

  if (buyToken.type === ItemType.NATIVE) {
    return {
      type: ItemType.NATIVE,
      amount: bnAmount.toString(),
    };
  }

  return {
    type: ItemType.ERC20,
    amount: bnAmount.toString(),
    contractAddress: buyToken.contractAddress,
  };
};

export const sell = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  orders: Array<SellOrder>,
): Promise<SellResult> => {
  let orderbook: Orderbook;
  let listing: PrepareListingResponse;
  let spenderAddress = '';

  const { buyToken, collection, makerFees } = orders[0];

  let decimals = 18;
  if (buyToken.type === ItemType.ERC20) {
    // get this from the allowed list
    const buyContract = new Contract(
      buyToken.contractAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );

    decimals = buyContract.decimals();
  }

  const buyTokenOrNative = getBuyToken(buyToken, decimals);

  try {
    const walletAddress = await provider.getSigner().getAddress();
    orderbook = await instance.createOrderbookInstance(config);
    const { seaportContractAddress } = orderbook.config();
    spenderAddress = seaportContractAddress;
    listing = await orderbook.prepareListing({
      makerAddress: walletAddress,
      buy: buyTokenOrNative,
      sell: {
        type: ItemType.ERC721,
        contractAddress: collection.address,
        tokenId: collection.id,
      },
    });
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while preparing the listing',
      CheckoutErrorType.PREPARE_ORDER_LISTING_ERROR,
      {
        message: err.message,
        collectionId: collection.id,
        collectionAddress: collection.address,
      },
    );
  }

  const itemRequirements = [
    getERC721Requirement(collection.id, collection.address, spenderAddress),
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
    const unsignedMessage = getUnsignedMessage(
      listing.orderHash,
      listing.orderComponents,
      listing.actions,
    );
    if (!unsignedMessage) {
      // For sell it is expected the orderbook will always return an unsigned message
      // If for some reason it is missing then we cannot proceed with the create listing
      throw new CheckoutError(
        'The unsigned message is missing after preparing the listing',
        CheckoutErrorType.SIGN_MESSAGE_ERROR,
        {
          collectionId: collection.id,
          collectionAddress: collection.address,
        },
      );
    }
    const signedMessage = await signMessage(
      provider,
      unsignedMessage,
    );
    const unsignedTransactions = await getUnsignedTransactions(listing.actions);
    const approvalResult = await signApprovalTransactions(provider, unsignedTransactions.approvalTransactions);
    if (approvalResult.type === SignTransactionStatusType.FAILED) {
      return {
        id: collection.id,
        collectionAddress: collection.address,
        smartCheckoutResult,
        status: {
          type: SellStatusType.FAILED,
          transactionHash: approvalResult.transactionHash,
          reason: approvalResult.reason,
        },
      };
    }

    let orderId = '';

    const createListingParams:CreateListingParams = {
      orderComponents: signedMessage.orderComponents,
      orderHash: signedMessage.orderHash,
      orderSignature: signedMessage.signedMessage,
    };

    if (makerFees !== undefined) {
      const orderBookFees = calculateFees(makerFees, buyTokenOrNative, decimals);
      // @TODO add support for an array of fees when the orderbook enables it
      const [makerFee] = orderBookFees;
      createListingParams.makerFee = makerFee;
    }

    try {
      const order = await orderbook.createListing(createListingParams);
      orderId = order.result.id;
    } catch (err: any) {
      throw new CheckoutError(
        'An error occurred while creating the listing',
        CheckoutErrorType.CREATE_ORDER_LISTING_ERROR,
        {
          message: err.message,
          collectionId: collection.id,
          collectionAddress: collection.address,
        },
      );
    }

    return {
      id: collection.id,
      collectionAddress: collection.address,
      smartCheckoutResult,
      status: {
        type: SellStatusType.SUCCESS,
        orderId,
      },
    };
  }

  return {
    id: collection.id,
    collectionAddress: collection.address,
    smartCheckoutResult,
  };
};

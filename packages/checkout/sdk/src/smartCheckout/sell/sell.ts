import { Contract, parseUnits } from 'ethers';
import {
  CreateListingParams,
  ERC20Item,
  NativeItem,
  Orderbook,
  PrepareListingResponse,
  constants,
  ERC721Item as OrderbookERC721Item,
  ERC1155Item as OrderbookERC1155Item,
} from '@imtbl/orderbook';
import { track } from '@imtbl/metrics';
import {
  ERC721Item,
  ERC1155Item,
  GasTokenType,
  ItemType,
  TransactionOrGasType,
  SellOrder,
  BuyToken,
  SellResult,
  CheckoutStatus,
  SmartCheckoutResult,
  SmartCheckoutSufficient,
  WrappedBrowserProvider,
} from '../../types';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { smartCheckout } from '../smartCheckout';
import {
  getUnsignedSellTransactions,
  getUnsignedMessage,
  signApprovalTransactions,
  signMessage,
} from '../actions';
import { SignTransactionStatusType } from '../actions/types';
import { calculateFees } from '../fees/fees';
import { ERC20ABI } from '../../env';
import { measureAsyncExecution } from '../../logger/debugLogger';
import { isPassportProvider } from '../routing';

export const getERC721Requirement = (
  id: string,
  contractAddress: string,
  spenderAddress: string,
): ERC721Item => ({
  type: ItemType.ERC721,
  id,
  contractAddress,
  spenderAddress,
});

export const getERC1155Requirement = (
  id: string,
  contractAddress: string,
  spenderAddress: string,
  amount: string,
): ERC1155Item => ({
  type: ItemType.ERC1155,
  id,
  contractAddress,
  spenderAddress,
  amount: BigInt(amount),
});

export const getBuyToken = (
  buyToken: BuyToken,
  decimals: number = 18,
): ERC20Item | NativeItem => {
  const bnAmount = parseUnits(buyToken.amount, decimals);

  if (buyToken.type === ItemType.NATIVE) {
    return {
      type: ItemType.NATIVE,
      amount: bnAmount.toString(),
    };
  }

  return {
    type: ItemType.ERC20,
    amount: bnAmount.toString(),
    contractAddress: buyToken.tokenAddress,
  };
};

export const sell = async (
  config: CheckoutConfiguration,
  provider: WrappedBrowserProvider,
  orders: Array<SellOrder>,
): Promise<SellResult> => {
  let orderbook: Orderbook;
  let listing: PrepareListingResponse;
  let spenderAddress = '';

  track('checkout_sdk', 'sell_initiated');

  if (orders.length === 0) {
    throw new CheckoutError(
      'No orders were provided to the orders array. Please provide at least one order.',
      CheckoutErrorType.PREPARE_ORDER_LISTING_ERROR,
    );
  }

  const {
    buyToken,
    sellToken,
    makerFees,
    orderExpiry,
  } = orders[0];

  let decimals = 18;
  if (buyToken.type === ItemType.ERC20) {
    // get this from the allowed list
    const buyTokenContract = new Contract(
      buyToken.tokenAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );

    decimals = await measureAsyncExecution<number>(
      config,
      'Time to get decimals of token contract for the buy token',
      buyTokenContract.decimals(),
    );
  }

  const buyTokenOrNative = getBuyToken(buyToken, decimals);
  const sellTokenHasType = 'type' in sellToken;

  try {
    const walletAddress = await measureAsyncExecution<string>(
      config,
      'Time to get the address from the provider',
      (await provider.getSigner()).getAddress(),
    );
    orderbook = instance.createOrderbookInstance(config);
    const { seaportContractAddress } = orderbook.config();
    spenderAddress = seaportContractAddress;

    const sellItem: OrderbookERC721Item | OrderbookERC1155Item = sellTokenHasType && sellToken.type === ItemType.ERC1155
      ? {
        type: ItemType.ERC1155,
        contractAddress: sellToken.collectionAddress,
        tokenId: sellToken.id,
        amount: sellToken.amount,
      }
      : {
        type: ItemType.ERC721,
        contractAddress: sellToken.collectionAddress,
        tokenId: sellToken.id,
      };

    listing = await measureAsyncExecution<PrepareListingResponse>(
      config,
      'Time to prepare the listing from the orderbook',
      orderbook.prepareListing({
        makerAddress: walletAddress,
        buy: buyTokenOrNative,
        sell: sellItem,
        orderExpiry,
      }),
    );
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while preparing the listing',
      CheckoutErrorType.PREPARE_ORDER_LISTING_ERROR,
      {
        error: err,
        id: sellToken.id,
        collectionAddress: sellToken.collectionAddress,
      },
    );
  }

  const itemRequirements: (ERC721Item | ERC1155Item)[] = [];
  if (sellTokenHasType && sellToken.type === ItemType.ERC1155) {
    const erc1155ItemRequirement = getERC1155Requirement(
      sellToken.id,
      sellToken.collectionAddress,
      spenderAddress,
      sellToken.amount,
    );
    itemRequirements.push(erc1155ItemRequirement);
  } else {
    const erc721ItemRequirement = getERC721Requirement(sellToken.id, sellToken.collectionAddress, spenderAddress);
    itemRequirements.push(erc721ItemRequirement);
  }

  let smartCheckoutResult;
  if (!isPassportProvider(provider)) {
    smartCheckoutResult = await measureAsyncExecution<SmartCheckoutResult>(
      config,
      'Total time running smart checkout',
      smartCheckout(
        config,
        provider,
        itemRequirements,
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigInt(constants.estimatedFulfillmentGasGwei),
          },
        },
      ),
    );
  } else {
    smartCheckoutResult = { sufficient: true, transactionRequirements: [] } as SmartCheckoutSufficient;
  }

  if (smartCheckoutResult.sufficient) {
    const unsignedTransactions = await getUnsignedSellTransactions(listing.actions);
    const approvalResult = await signApprovalTransactions(provider, unsignedTransactions.approvalTransactions);
    if (approvalResult.type === SignTransactionStatusType.FAILED) {
      return {
        status: CheckoutStatus.FAILED,
        transactionHash: approvalResult.transactionHash,
        reason: approvalResult.reason,
        smartCheckoutResult,
      };
    }

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
          id: sellToken.id,
          collectionAddress: sellToken.collectionAddress,
        },
      );
    }
    const signedMessage = await signMessage(
      provider,
      unsignedMessage,
    );

    let orderId = '';

    const createListingParams: CreateListingParams = {
      orderComponents: signedMessage.orderComponents,
      orderHash: signedMessage.orderHash,
      orderSignature: signedMessage.signedMessage,
      makerFees: [],
    };

    if (makerFees !== undefined) {
      let tokenQuantity = BigInt(1);

      // if type exists in sellToken then it is valid ERC721 or ERC1155 and not deprecated type
      if (sellTokenHasType && sellToken.type === ItemType.ERC1155) tokenQuantity = BigInt(sellToken.amount);

      const orderBookFees = calculateFees(makerFees, buyTokenOrNative.amount, decimals, tokenQuantity);
      if (orderBookFees.length !== makerFees.length) {
        throw new CheckoutError(
          'One of the fees is too small, must be greater than 0.000001',
          CheckoutErrorType.CREATE_ORDER_LISTING_ERROR,
        );
      }
      createListingParams.makerFees = orderBookFees;
    }

    try {
      const order = await orderbook.createListing(createListingParams);
      orderId = order.result.id;
    } catch (err: any) {
      throw new CheckoutError(
        'An error occurred while creating the listing',
        CheckoutErrorType.CREATE_ORDER_LISTING_ERROR,
        {
          error: err,
          collectionId: sellToken.id,
          collectionAddress: sellToken.collectionAddress,
        },
      );
    }

    return {
      status: CheckoutStatus.SUCCESS,
      orderIds: [orderId],
      smartCheckoutResult,
    };
  }

  return {
    status: CheckoutStatus.INSUFFICIENT_FUNDS,
    smartCheckoutResult,
  };
};

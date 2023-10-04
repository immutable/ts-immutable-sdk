import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import {
  BigNumber,
} from 'ethers';
import {
  ERC20Item,
  NativeItem,
  constants,
  ListingResult,
  FeeValue,
  Action,
} from '@imtbl/orderbook';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  ItemType,
  ItemRequirement,
  GasTokenType,
  TransactionOrGasType,
  GasAmount,
  FulfillmentTransaction,
  BuyResult,
  CheckoutStatus,
  BuyOrder,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import {
  getUnsignedERC20ApprovalTransactions,
  getUnsignedFulfillmentTransactions,
  signApprovalTransactions,
  signFulfillmentTransactions,
} from '../actions';
import { SignTransactionStatusType } from '../actions/types';
import { ERC20ABI } from '../../types';
import { calculateFees } from '../fees/fees';

export const getItemRequirement = (
  type: ItemType,
  contractAddress: string,
  amount: BigNumber,
  spenderAddress: string,
): ItemRequirement => {
  switch (type) {
    case ItemType.ERC20:
      return {
        type,
        amount,
        contractAddress,
        spenderAddress,
      };
    case ItemType.NATIVE:
    default:
      return {
        type: ItemType.NATIVE,
        amount,
      };
  }
};

export const getTransactionOrGas = (
  gasLimit: number,
  fulfillmentTransactions: TransactionRequest[],
): FulfillmentTransaction | GasAmount => {
  if (fulfillmentTransactions.length > 0) {
    return {
      type: TransactionOrGasType.TRANSACTION,
      transaction: fulfillmentTransactions[0],
    };
  }

  return {
    type: TransactionOrGasType.GAS,
    gasToken: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(gasLimit),
    },
  };
};

export const buy = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  orders: Array<BuyOrder>,
): Promise<BuyResult> => {
  let orderbook;
  let order: ListingResult;
  let spenderAddress = '';
  const gasLimit = constants.estimatedFulfillmentGasGwei;

  if (orders.length === 0) {
    throw new CheckoutError(
      'No orders were passed in, must pass at least one order',
      CheckoutErrorType.FULFILL_ORDER_LISTING_ERROR,
    );
  }

  const { id, takerFees } = orders[0];

  try {
    orderbook = await instance.createOrderbookInstance(config);
    order = await orderbook.getListing(id);
    const { seaportContractAddress } = orderbook.config();
    spenderAddress = seaportContractAddress;
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while getting the order listing',
      CheckoutErrorType.GET_ORDER_LISTING_ERROR,
      {
        orderId: id,
        message: err.message,
      },
    );
  }

  if (order.result.buy.length === 0) {
    throw new CheckoutError(
      'An error occurred with the get order listing',
      CheckoutErrorType.GET_ORDER_LISTING_ERROR,
      {
        orderId: id,
        message: 'No buy side tokens found on order',
      },
    );
  }
  const buyToken = order.result.buy[0];
  let decimals = 18;
  if (order.result.buy[0].type === 'ERC20') {
    const tokenContract = instance.getTokenContract(
      order.result.buy[0].contractAddress,
      ERC20ABI,
      provider,
    );
    decimals = await tokenContract.decimals();
  }

  let fees: FeeValue[] = [];
  if (takerFees && takerFees.length > 0) {
    fees = calculateFees(takerFees, buyToken.amount, decimals);
  }

  let unsignedApprovalTransactions: TransactionRequest[] = [];
  let unsignedFulfillmentTransactions: TransactionRequest[] = [];
  let orderActions: Action[] = [];
  try {
    const fulfillerAddress = await provider.getSigner().getAddress();
    const { actions } = await orderbook.fulfillOrder(id, fulfillerAddress, fees);
    orderActions = actions;
    unsignedApprovalTransactions = await getUnsignedERC20ApprovalTransactions(actions);
  } catch {
    // Silently ignore error as this is usually thrown if user does not have enough balance
  }

  try {
    unsignedFulfillmentTransactions = await getUnsignedFulfillmentTransactions(orderActions);
  } catch {
    // if cannot estimate gas then silently continue and use gas limit in smartCheckout
    // but get the fulfillment transactions after they have approved the spending
  }

  let amount = BigNumber.from('0');
  let type: ItemType = ItemType.NATIVE;
  let contractAddress = '';

  const buyArray = order.result.buy;
  if (buyArray.length > 0) {
    switch (buyArray[0].type) {
      case 'NATIVE':
        type = ItemType.NATIVE;
        break;
      case 'ERC20':
        type = ItemType.ERC20;
        contractAddress = buyArray[0].contractAddress;
        break;
      default:
        throw new CheckoutError(
          'Purchasing token type is unsupported',
          CheckoutErrorType.UNSUPPORTED_TOKEN_TYPE_ERROR,
          {
            orderId: id,
          },
        );
    }
  }

  buyArray.forEach((item: (ERC20Item | NativeItem)) => {
    if (item.type !== ItemType.ERC721 as string) {
      amount = amount.add(BigNumber.from(item.amount));
    }
  });

  const feeArray = order.result.fees;
  feeArray.forEach((item: any) => {
    amount = amount.add(BigNumber.from(item.amount));
  });

  const itemRequirements = [
    getItemRequirement(type, contractAddress, amount, spenderAddress),
  ];

  const smartCheckoutResult = await smartCheckout(
    config,
    provider,
    itemRequirements,
    getTransactionOrGas(
      gasLimit,
      unsignedFulfillmentTransactions,
    ),
  );

  if (smartCheckoutResult.sufficient) {
    const approvalResult = await signApprovalTransactions(provider, unsignedApprovalTransactions);
    if (approvalResult.type === SignTransactionStatusType.FAILED) {
      return {
        status: CheckoutStatus.FAILED,
        transactionHash: approvalResult.transactionHash,
        reason: approvalResult.reason,
        smartCheckoutResult: [smartCheckoutResult],
      };
    }

    try {
      if (unsignedFulfillmentTransactions.length === 0) {
        unsignedFulfillmentTransactions = await getUnsignedFulfillmentTransactions(orderActions);
      }
    } catch (err: any) {
      throw new CheckoutError(
        'Error fetching fulfillment transaction',
        CheckoutErrorType.FULFILL_ORDER_LISTING_ERROR,
        {
          message: err.message,
        },
      );
    }

    const fulfillmentResult = await signFulfillmentTransactions(provider, unsignedFulfillmentTransactions);
    if (fulfillmentResult.type === SignTransactionStatusType.FAILED) {
      return {
        status: CheckoutStatus.FAILED,
        transactionHash: fulfillmentResult.transactionHash,
        reason: fulfillmentResult.reason,
        smartCheckoutResult: [smartCheckoutResult],
      };
    }

    return {
      status: CheckoutStatus.SUCCESS,
      smartCheckoutResult: [smartCheckoutResult],
    };
  }

  return {
    status: CheckoutStatus.INSUFFICIENT_FUNDS,
    smartCheckoutResult: [smartCheckoutResult],
  };
};

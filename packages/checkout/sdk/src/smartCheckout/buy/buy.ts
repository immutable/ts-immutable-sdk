import {
  ERC20Item,
  NativeItem,
  constants,
  ListingResult,
  FeeValue,
  Action,
  FulfillOrderResponse,
  OrderStatusName,
} from '@imtbl/orderbook';
import { mr } from '@imtbl/generated-clients';
import { track } from '@imtbl/metrics';
import { TransactionRequest, TransactionResponse } from 'ethers';
import * as instance from '../../instance';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../config';
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
  SmartCheckoutResult, BuyOverrides,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import {
  getUnsignedERC20ApprovalTransactions,
  getUnsignedFulfillmentTransactions,
  signApprovalTransactions,
  signFulfillmentTransactions,
} from '../actions';
import { SignTransactionStatusType } from '../actions/types';
import { calculateFees } from '../fees/fees';
import { getAllBalances, resetBlockscoutClientMap } from '../../balances';
import { debugLogger, measureAsyncExecution } from '../../logger/debugLogger';
import { sendTransaction } from '../../transaction';
import { WrappedBrowserProvider } from '../../types';

export const getItemRequirement = (
  type: ItemType,
  tokenAddress: string,
  amount: bigint,
  spenderAddress: string,
  isFee: boolean = false,
): ItemRequirement => {
  switch (type) {
    case ItemType.ERC20:
      return {
        type,
        amount,
        tokenAddress,
        spenderAddress,
        isFee,
      };
    case ItemType.NATIVE:
    default:
      return {
        type: ItemType.NATIVE,
        amount,
        isFee,
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
      limit: BigInt(gasLimit),
    },
  };
};

export const buy = async (
  config: CheckoutConfiguration,
  provider: WrappedBrowserProvider,
  orders: Array<BuyOrder>,
  overrides: BuyOverrides = {
    waitFulfillmentSettlements: true,
  },
): Promise<BuyResult> => {
  track('checkout_sdk', 'buy_initiated');

  if (orders.length === 0) {
    throw new CheckoutError(
      'No orders were provided to the orders array. Please provide at least one order.',
      CheckoutErrorType.FULFILL_ORDER_LISTING_ERROR,
    );
  }

  let order: ListingResult;
  let spenderAddress = '';
  let decimals = 18;

  const gasLimit = constants.estimatedFulfillmentGasGwei;
  const orderbook = instance.createOrderbookInstance(config);
  const blockchainClient = instance.createBlockchainDataInstance(config);

  const fulfillerAddress = await measureAsyncExecution<string>(
    config,
    'Time to get the address from the provider',
    (await provider.getSigner()).getAddress(),
  );

  // Prefetch balances and store them in memory
  resetBlockscoutClientMap();
  getAllBalances(config, provider, fulfillerAddress, getL1ChainId(config));
  getAllBalances(config, provider, fulfillerAddress, getL2ChainId(config));

  const { id, takerFees, fillAmount } = orders[0];

  let orderChainName: string;
  try {
    order = await measureAsyncExecution<ListingResult>(
      config,
      'Time to fetch the listing from the orderbook',
      orderbook.getListing(id),
    );
    const { seaportContractAddress, chainName } = orderbook.config();

    orderChainName = chainName;
    spenderAddress = seaportContractAddress;
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while getting the order listing',
      CheckoutErrorType.GET_ORDER_LISTING_ERROR,
      {
        error: err,
        orderId: id,
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
  if (buyToken.type === 'ERC20') {
    const token = await measureAsyncExecution<mr.GetTokenResult>(
      config,
      'Time to get decimals of token contract for the buy token',
      blockchainClient.getToken({ contractAddress: buyToken.contractAddress, chainName: orderChainName }),
    );

    if (token.result.decimals) decimals = token.result.decimals;
  }

  let fees: FeeValue[] = [];
  if (takerFees && takerFees.length > 0) {
    // eslint-disable-next-line max-len
    const tokenQuantity = order.result.sell[0].type === ItemType.ERC721 ? BigInt(1) : BigInt(order.result.sell[0].amount);
    fees = calculateFees(takerFees, buyToken.amount, decimals, tokenQuantity);
  }

  let unsignedApprovalTransactions: TransactionRequest[] = [];
  let unsignedFulfillmentTransactions: TransactionRequest[] = [];
  let orderActions: Action[] = [];

  const fulfillOrderStartTime = performance.now();
  try {
    const { actions } = await measureAsyncExecution<FulfillOrderResponse>(
      config,
      'Time to call fulfillOrder from the orderbook',
      orderbook.fulfillOrder(id, fulfillerAddress, fees, fillAmount),
    );

    orderActions = actions;
    unsignedApprovalTransactions = await measureAsyncExecution<TransactionRequest[]>(
      config,
      'Time to construct the unsigned approval transactions',
      getUnsignedERC20ApprovalTransactions(actions),
    );
  } catch (err: any) {
    const elapsedTimeInSeconds = (performance.now() - fulfillOrderStartTime) / 1000;
    debugLogger(config, 'Time to call fulfillOrder from the orderbook', elapsedTimeInSeconds);

    if (err.message.includes(OrderStatusName.EXPIRED)) {
      throw new CheckoutError('Order is expired', CheckoutErrorType.ORDER_EXPIRED_ERROR, { orderId: id });
    }

    // The balances error will be handled by bulk order fulfillment but for now we
    // need to assert on this string to check that the error is not a balances error
    if (!err.message.includes('The fulfiller does not have the balances needed to fulfill')) {
      throw new CheckoutError(
        'Error occurred while trying to fulfill the order',
        CheckoutErrorType.FULFILL_ORDER_LISTING_ERROR,
        {
          orderId: id,
          error: err,
        },
      );
    }
  }

  try {
    unsignedFulfillmentTransactions = await measureAsyncExecution<TransactionRequest[]>(
      config,
      'Time to construct the unsigned fulfillment transactions',
      getUnsignedFulfillmentTransactions(orderActions),
    );
  } catch {
    // if cannot estimate gas then silently continue and use gas limit in smartCheckout
    // but get the fulfillment transactions after they have approved the spending
  }

  let amount = BigInt('0');
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
      amount += BigInt(item.amount);
    }
  });

  const feeArray = order.result.fees;
  feeArray.forEach((item: any) => {
    amount += BigInt(item.amount);
  });

  // In the event that the user is filling an ERC1155 listing, the amount required will be scaled by the fill ratio
  if (order.result.sell[0].type === 'ERC1155' && fillAmount) {
    amount = (amount * BigInt(fillAmount)) / BigInt(order.result.sell[0].amount);
  }

  const itemRequirements = [
    getItemRequirement(type, contractAddress, amount, spenderAddress),
  ];

  const smartCheckoutResult = await measureAsyncExecution<SmartCheckoutResult>(
    config,
    'Total time running smart checkout',
    smartCheckout(
      config,
      provider,
      itemRequirements,
      getTransactionOrGas(
        gasLimit,
        unsignedFulfillmentTransactions,
      ),
    ),
  );

  if (smartCheckoutResult.sufficient) {
    const approvalResult = await signApprovalTransactions(provider, unsignedApprovalTransactions);
    if (approvalResult.type === SignTransactionStatusType.FAILED) {
      return {
        status: CheckoutStatus.FAILED,
        transactionHash: approvalResult.transactionHash,
        reason: approvalResult.reason,
        smartCheckoutResult,
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
        { error: err },
      );
    }
    if (overrides.waitFulfillmentSettlements) {
      const fulfillmentResult = await signFulfillmentTransactions(provider, unsignedFulfillmentTransactions);
      if (fulfillmentResult.type === SignTransactionStatusType.FAILED) {
        return {
          status: CheckoutStatus.FAILED,
          transactionHash: fulfillmentResult.transactionHash,
          reason: fulfillmentResult.reason,
          smartCheckoutResult,
        };
      }

      return {
        status: CheckoutStatus.SUCCESS,
        smartCheckoutResult,
      };
    }

    let transactions: TransactionResponse[];
    try {
      const response = await Promise.all(unsignedFulfillmentTransactions.map(
        (transaction) => sendTransaction(provider, transaction),
      ));
      transactions = response.map((result) => result.transactionResponse);
    } catch (err: any) {
      throw new CheckoutError(
        'An error occurred while executing the fulfillment transaction',
        CheckoutErrorType.EXECUTE_FULFILLMENT_TRANSACTION_ERROR,
        {
          message: err.message,
        },
      );
    }
    return {
      status: CheckoutStatus.FULFILLMENTS_UNSETTLED,
      smartCheckoutResult,
      transactions,
    };
  }

  return {
    status: CheckoutStatus.INSUFFICIENT_FUNDS,
    smartCheckoutResult,
  };
};

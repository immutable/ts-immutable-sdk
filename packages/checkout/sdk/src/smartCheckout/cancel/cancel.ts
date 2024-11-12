import { CancelOrdersOnChainResponse, Orderbook } from '@imtbl/orderbook';
import { BrowserProvider, TransactionResponse, PreparedTransactionRequest } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import * as instance from '../../instance';
import { signFulfillmentTransactions } from '../actions';
import {
  CancelOverrides,
  CancelResult,
  CancelResultFailed,
  CancelResultFulfillmentsUnsettled,
  CancelResultGasless,
  CancelResultSuccess,
  CheckoutStatus,
} from '../../types';
import { SignTransactionStatusType } from '../actions/types';
import { measureAsyncExecution } from '../../logger/debugLogger';
import { sendTransaction } from '../../transaction';

const cancelOnChain = async (
  config: CheckoutConfiguration,
  orderbook: Orderbook,
  provider: BrowserProvider,
  orderIds: string[],
  waitFulfillmentSettlements: boolean,
): Promise<CancelResultSuccess | CancelResultFailed | CancelResultFulfillmentsUnsettled> => {
  let unsignedCancelOrderTransaction: PreparedTransactionRequest;
  if (orderIds.length === 0) {
    throw new CheckoutError(
      'No orderIds were provided to the orderIds array. Please provide at least one orderId.',
      CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR,
    );
  }
  // Update this when bulk cancel is supported
  const orderId = orderIds[0];
  try {
    const offererAddress = await measureAsyncExecution<string>(
      config,
      'Time to get the address from the provider',
      (await provider.getSigner()).getAddress(),
    );
    const cancelOrderResponse = await measureAsyncExecution<CancelOrdersOnChainResponse>(
      config,
      'Time to get the cancel order from the orderbook',
      orderbook.cancelOrdersOnChain(
        [orderId],
        offererAddress,
      ),
    );

    unsignedCancelOrderTransaction = await cancelOrderResponse.cancellationAction.buildTransaction();
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while cancelling the order listing',
      CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR,
      {
        orderId,
        error: err,
      },
    );
  }

  if (waitFulfillmentSettlements) {
    const result = await signFulfillmentTransactions(provider, [unsignedCancelOrderTransaction]);
    if (result.type === SignTransactionStatusType.FAILED) {
      return {
        status: CheckoutStatus.FAILED,
        transactionHash: result.transactionHash,
        reason: result.reason,
      };
    }

    return {
      status: CheckoutStatus.SUCCESS,
    };
  }

  let transactions: TransactionResponse[];
  try {
    const response = await Promise.all([unsignedCancelOrderTransaction].map(
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
    transactions,
  };
};

const gaslessCancel = async (
  orderbook: Orderbook,
  provider: BrowserProvider,
  orderIds: string[],
): Promise<CancelResultGasless> => {
  try {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const { signableAction } = await orderbook.prepareOrderCancellations(orderIds);

    // eslint-disable-next-line no-underscore-dangle
    const signedMessage = await signer.signTypedData(
      signableAction.message.domain,
      signableAction.message.types,
      signableAction.message.value,
    );
    const { result } = await orderbook.cancelOrders(orderIds, address, signedMessage);

    const successfulCancellations = [];
    const failedCancellations = [];
    const pendingCancellations = [];

    for (const success of result.successful_cancellations) {
      successfulCancellations.push({
        orderId: success,
      });
    }

    for (const failed of result.failed_cancellations) {
      failedCancellations.push({
        orderId: failed.order,
        reason: failed.reason_code,
      });
    }

    for (const pending of result.pending_cancellations) {
      pendingCancellations.push({
        orderId: pending,
      });
    }

    return {
      successfulCancellations,
      failedCancellations,
      pendingCancellations,
    };
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while cancelling the order listing',
      CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR,
      {
        orderIds,
        error: err,
      },
    );
  }
};

export const cancel = async (
  config: CheckoutConfiguration,
  provider: BrowserProvider,
  orderIds: string[],
  overrides: CancelOverrides = {
    waitFulfillmentSettlements: true,
    useGaslessCancel: false,
  },
): Promise<CancelResult> => {
  const orderbook = instance.createOrderbookInstance(config);

  if (overrides.useGaslessCancel) {
    return await gaslessCancel(orderbook, provider, orderIds);
  }

  return await cancelOnChain(
    config,
    orderbook,
    provider,
    orderIds,
    overrides.waitFulfillmentSettlements ?? true,
  );
};

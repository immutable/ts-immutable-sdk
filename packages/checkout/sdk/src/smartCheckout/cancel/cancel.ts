import { Web3Provider } from '@ethersproject/providers';
import { PopulatedTransaction } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import * as instance from '../../instance';
import { signFulfillmentTransactions } from '../actions';
import {
  CancelResult,
  CheckoutStatus,
} from '../../types';
import { SignTransactionStatusType } from '../actions/types';
import { performanceAsyncSnapshot } from '../../utils/performance';

export const cancel = performanceAsyncSnapshot(async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  orderIds: string[],
): Promise<CancelResult> => {
  let unsignedCancelOrderTransaction: PopulatedTransaction;
  if (orderIds.length === 0) {
    throw new CheckoutError(
      'No orderIds were provided to the orderIds array. Please provide at least one orderId.',
      CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR,
    );
  }
  // Update this when bulk cancel is supported
  const orderId = orderIds[0];
  try {
    performance.mark('getSigner-start');
    const offererAddress = await provider.getSigner().getAddress();
    performance.mark('getSigner-end');
    performance.measure('getSigner', 'getSigner-start', 'getSigner-end');
    const orderbook = await instance.createOrderbookInstance(config);
    performance.mark('orderbook-cancelOrder-start');
    const cancelOrderResponse = await orderbook.cancelOrder(
      orderId,
      offererAddress,
    );
    performance.mark('orderbook-cancelOrder-end');
    performance.measure('orderbook-cancelOrder', 'orderbook-cancelOrder-start', 'orderbook-cancelOrder-end');
    unsignedCancelOrderTransaction = cancelOrderResponse.unsignedCancelOrderTransaction;
  } catch (err: any) {
    performance.mark('orderbook-cancelOrder-end');
    performance.measure('orderbook-cancelOrder', 'orderbook-cancelOrder-start', 'orderbook-cancelOrder-end');
    throw new CheckoutError(
      'An error occurred while cancelling the order listing',
      CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR,
      {
        orderId,
        message: err.message,
      },
    );
  }

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
}, 'cancel');

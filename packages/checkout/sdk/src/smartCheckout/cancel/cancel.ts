import { Web3Provider } from '@ethersproject/providers';
import { PopulatedTransaction } from 'ethers';
import { CancelOrdersOnChainResponse } from '@imtbl/orderbook';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import * as instance from '../../instance';
import { signFulfillmentTransactions } from '../actions';
import {
  CancelResult,
  CheckoutStatus,
} from '../../types';
import { SignTransactionStatusType } from '../actions/types';
import { measureAsyncExecution } from '../../utils/debugLogger';

export const cancel = async (
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
    const offererAddress = await measureAsyncExecution<string>(
      config,
      'Time to get the address from the provider',
      provider.getSigner().getAddress(),
    );
    const orderbook = instance.createOrderbookInstance(config);
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
};

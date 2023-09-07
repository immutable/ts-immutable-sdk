import { Web3Provider } from '@ethersproject/providers';
import { PopulatedTransaction } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import * as instance from '../../instance';
import { signFulfilmentTransactions } from '../actions';
import { CancelResponse, CancelStatusType } from '../../types';
import { SignTransactionStatusType } from '../actions/types';

export const cancel = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  orderId: string,
): Promise<CancelResponse> => {
  let unsignedCancelOrderTransaction: PopulatedTransaction;
  try {
    const offererAddress = await provider.getSigner().getAddress();
    const orderbook = await instance.createOrderbookInstance(config);
    const cancelOrderResponse = await orderbook.cancelOrder(
      orderId,
      offererAddress,
    );
    unsignedCancelOrderTransaction = cancelOrderResponse.unsignedCancelOrderTransaction;
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

  const result = await signFulfilmentTransactions(provider, [unsignedCancelOrderTransaction]);
  if (result.type === SignTransactionStatusType.FAILED) {
    return {
      orderId,
      status: {
        type: CancelStatusType.FAILED,
        transactionHash: result.transactionHash,
        reason: result.reason,
      },
    };
  }

  return {
    orderId,
    status: {
      type: CancelStatusType.SUCCESS,
    },
  };
};

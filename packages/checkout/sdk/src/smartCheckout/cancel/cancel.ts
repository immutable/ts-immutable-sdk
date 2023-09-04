import { Web3Provider } from '@ethersproject/providers';
import { PopulatedTransaction } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CancelResult } from '../../types/cancel';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import * as instance from '../../instance';

export const cancel = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  orderId: string,
): Promise<CancelResult> => {
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

  return {
    unsignedCancelOrderTransaction,
  };
};

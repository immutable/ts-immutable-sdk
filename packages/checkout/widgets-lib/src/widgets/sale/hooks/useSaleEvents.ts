import { useContext } from 'react';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import {
  sendSaleFailedEvent,
  sendSaleSuccessEvent,
  sendSaleWidgetCloseEvent,
  sendSaleTransactionSuccessEvent,
  sendSalePaymentMethodEvent,
  sendSalePaymentTokenEvent,
} from '../SaleWidgetEvents';
import { ExecutedTransaction, FundingBalance } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';
import { getPaymentTokenDetails } from '../utils/analytics';

export const useSaleEvent = () => {
  const { paymentMethod } = useSaleContext();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const sendCloseEvent = () => {
    sendSaleWidgetCloseEvent(eventTarget);
  };

  const sendSuccessEvent = (
    transactions: ExecutedTransaction[] = [],
    tokenIds: string[] = [],
    details: Record<string, any> = {},
  ) => {
    sendSaleSuccessEvent(
      eventTarget,
      paymentMethod,
      transactions,
      tokenIds,
      details.transactionId,
    );
  };

  const sendFailedEvent = (
    reason: string,
    error: Record<string, unknown>,
    transactions: ExecutedTransaction[] = [],
    details: Record<string, any> = {},
  ) => {
    sendSaleFailedEvent(
      eventTarget,
      reason,
      error,
      paymentMethod,
      transactions,
      details.transactionId,
    );
  };

  const sendTransactionSuccessEvent = (transaction: ExecutedTransaction) => {
    sendSaleTransactionSuccessEvent(eventTarget, paymentMethod, [transaction]);
  };

  const sendSelectedPaymentMethod = (type: SalePaymentTypes) => {
    sendSalePaymentMethodEvent(eventTarget, type);
  };

  const sendSelectedPaymentToken = (
    fundingBalance: FundingBalance,
    conversions: Map<string, number>,
  ) => {
    const details = getPaymentTokenDetails(fundingBalance, conversions);
    sendSalePaymentTokenEvent(eventTarget, details);
  };

  return {
    sendCloseEvent,
    sendSuccessEvent,
    sendFailedEvent,
    sendTransactionSuccessEvent,
    sendSelectedPaymentMethod,
    sendSelectedPaymentToken,
  };
};

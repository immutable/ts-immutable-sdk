import { useContext } from 'react';
import { PurchaseError, PurchaseErrorTypes } from '../types';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

import { useError } from './useError';

import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { sendPurchaseFailedEvent } from '../PurchaseWidgetEvents';
import { PurchaseContext } from '../context/PurchaseContext';

export const useErrorHandler = () => {
  const {
    purchaseState: { id: contextId },
  } = useContext(PurchaseContext);

  const {
    providersState: {
      checkout,
    },
  } = useProvidersContext();

  const { showErrorHandover } = useError(checkout.config.environment);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const onTransactionError = (err: unknown) => {
    const reason = `${(err as any)?.reason || (err as any)?.message || ''
    }`.toLowerCase();

    let errorType = PurchaseErrorTypes.WALLET_FAILED;

    if (reason.includes('failed') && reason.includes('open confirmation')) {
      errorType = PurchaseErrorTypes.WALLET_POPUP_BLOCKED;
    }

    if (reason.includes('rejected') && reason.includes('user')) {
      errorType = PurchaseErrorTypes.WALLET_REJECTED;
    }

    if (
      reason.includes('failed to submit')
            && reason.includes('highest gas limit')
    ) {
      errorType = PurchaseErrorTypes.WALLET_REJECTED_NO_FUNDS;
    }

    if (
      reason.includes('status failed')
            || reason.includes('transaction failed')
    ) {
      errorType = PurchaseErrorTypes.TRANSACTION_FAILED;
      sendPurchaseFailedEvent(eventTarget, errorType);
    }

    if (reason.includes('unrecognized chain')) {
      errorType = PurchaseErrorTypes.UNRECOGNISED_CHAIN;
    }

    const error: PurchaseError = {
      type: errorType,
      data: { error: err },
    };

    showErrorHandover(errorType, { contextId, error });
  };

  return { onTransactionError };
};

import { useContext } from 'react';
import { AddTokensError, AddTokensErrorTypes } from '../types';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendAddTokensFailedEvent } from '../AddTokensWidgetEvents';
import { useError } from '../../../lib/squid/hooks/useError';
import { AddTokensContext } from '../context/AddTokensContext';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';

export const useErrorHandler = () => {
  const {
    addTokensState: { id: contextId },
  } = useContext(AddTokensContext);

  const {
    providersState: {
      checkout,
    },
  } = useProvidersContext();

  const { showErrorHandover } = useError(checkout.config.environment);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const handleTransactionError = (err: unknown) => {
    const reason = `${(err as any)?.reason || (err as any)?.message || ''
    }`.toLowerCase();

    let errorType = AddTokensErrorTypes.WALLET_FAILED;

    if (reason.includes('failed') && reason.includes('open confirmation')) {
      errorType = AddTokensErrorTypes.WALLET_POPUP_BLOCKED;
    }

    if (reason.includes('rejected') && reason.includes('user')) {
      errorType = AddTokensErrorTypes.WALLET_REJECTED;
    }

    if (
      reason.includes('failed to submit')
            && reason.includes('highest gas limit')
    ) {
      errorType = AddTokensErrorTypes.WALLET_REJECTED_NO_FUNDS;
    }

    if (
      reason.includes('status failed')
            || reason.includes('transaction failed')
    ) {
      errorType = AddTokensErrorTypes.TRANSACTION_FAILED;
      sendAddTokensFailedEvent(eventTarget, errorType);
    }

    if (reason.includes('unrecognized chain')) {
      errorType = AddTokensErrorTypes.UNRECOGNISED_CHAIN;
    }

    const error: AddTokensError = {
      type: errorType,
      data: { error: err },
    };

    showErrorHandover(errorType, { contextId, error });
  };

  return { handleTransactionError };
};

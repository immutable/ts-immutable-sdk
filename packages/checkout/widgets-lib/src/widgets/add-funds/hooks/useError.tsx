import { Environment } from '@imtbl/config';
import { useContext } from 'react';
import { AddFundsErrorTypes, RiveStateMachineInput } from '../types';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { getRemoteRive } from '../../../lib/utils';
import { APPROVE_TXN_ANIMATION } from '../utils/config';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { sendAddFundsCloseEvent } from '../AddFundsWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { AddFundsWidgetViews } from '../../../context/view-context/AddFundsViewContextTypes';

interface ErrorConfig {
  headingText: string;
  subHeadingText?: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
}

export const useError = (environment: Environment) => {
  const { viewDispatch } = useContext(ViewContext);

  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const closeWidget = () => {
    sendAddFundsCloseEvent(eventTarget);
  };

  const goBackToAddFundsView = () => {
    closeHandover();

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: AddFundsWidgetViews.ADD_FUNDS,
        },
      },
    });
  };

  const resetError = () => {
    closeHandover();
  };

  const errorConfig: Record<AddFundsErrorTypes, ErrorConfig> = {
    [AddFundsErrorTypes.SQUID_ROUTE_EXECUTION_FAILED]: {
      headingText: 'Failed executing the route',
      subHeadingText: 'The transaction failed. Please try again.',
      onPrimaryButtonClick: () => {},
      onSecondaryButtonClick: goBackToAddFundsView,
    },
    [AddFundsErrorTypes.WALLET_REJECTED]: {
      headingText: 'Transaction rejected',
      subHeadingText: 'The transaction was rejected. Please try again.',
      onSecondaryButtonClick: goBackToAddFundsView,

    },
    [AddFundsErrorTypes.SERVICE_BREAKDOWN]: {
      headingText: 'Transaction timeout',
      subHeadingText: 'The transaction timed out. Please try again.',
      onSecondaryButtonClick: closeWidget,

    },
    [AddFundsErrorTypes.WALLET_POPUP_BLOCKED]: {
      headingText: 'Unknown error',
      subHeadingText: 'An unknown error occurred. Please try again.',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
    [AddFundsErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      headingText: 'Insufficient funds',
      subHeadingText: 'You have insufficient funds. Please try again.',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
    [AddFundsErrorTypes.WALLET_FAILED]: {
      headingText: 'Transaction failed',
      subHeadingText: 'The transaction failed. Please try again.',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
    [AddFundsErrorTypes.DEFAULT]: {
      headingText: 'Unknown error',
      subHeadingText: 'An unknown error occurred. Please try again.',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
    [AddFundsErrorTypes.INVALID_PARAMETERS]: {
      headingText: 'Invalid parameters',
      subHeadingText: 'The parameters provided are invalid. Please try again.',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
  };

  const getErrorConfig = (errorType: AddFundsErrorTypes) => errorConfig[errorType];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showErrorHandover = (errorType: AddFundsErrorTypes, data?: Record<string, unknown>) => {
    addHandover({
      animationUrl: getRemoteRive(
        environment,
        APPROVE_TXN_ANIMATION,
      ),
      inputValue: RiveStateMachineInput.ERROR,
      children: <HandoverContent
        headingText={getErrorConfig(errorType).headingText}
        subheadingText={getErrorConfig(errorType).subHeadingText}
        onPrimaryButtonClick={getErrorConfig(errorType).onPrimaryButtonClick}
        onSecondaryButtonClick={getErrorConfig(errorType).onSecondaryButtonClick}
      />,
    });
  };

  return {
    resetError,
    showErrorHandover,
  };
};

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
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { AddFundsWidgetViews } from '../../../context/view-context/AddFundsViewContextTypes';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';

interface ErrorConfig {
  headingText: string;
  subHeadingText?: string;
  primaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}

export const useError = (environment: Environment) => {
  const { viewDispatch } = useContext(ViewContext);

  const { page } = useAnalytics();
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

  const errorConfig: Record<AddFundsErrorTypes, ErrorConfig> = {
    [AddFundsErrorTypes.DEFAULT]: {
      headingText: 'Sorry, something went wrong. Please try again later.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddFundsErrorTypes.INVALID_PARAMETERS]: {
      headingText: 'Invalid parameters',
      subHeadingText:
        'The widget parameters provided are invalid. Please check again.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddFundsErrorTypes.SERVICE_BREAKDOWN]: {
      headingText: 'Our system is currently down',
      subHeadingText:
        'We are currently experiencing technical difficulties. Please try again later.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddFundsErrorTypes.TRANSACTION_FAILED]: {
      headingText: 'Transaction failed',
      subHeadingText: 'The transaction failed. Please try again.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddFundsView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddFundsErrorTypes.WALLET_FAILED]: {
      headingText: 'Transaction failed',
      subHeadingText: 'The transaction failed. Please try again.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddFundsView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
    [AddFundsErrorTypes.WALLET_REJECTED]: {
      headingText: 'Transaction rejected',
      subHeadingText:
        "You'll need to approve the transaction in your wallet to proceed.",
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddFundsView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddFundsErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      headingText: 'Insufficient funds',
      subHeadingText:
        'You do not have enough funds to complete the transaction.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddFundsView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddFundsErrorTypes.WALLET_POPUP_BLOCKED]: {
      headingText: "Browser's popup blocked",
      subHeadingText: 'Please allow pop-ups in your browser to proceed.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddFundsView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: goBackToAddFundsView,
    },
  };

  const getErrorConfig = (errorType: AddFundsErrorTypes) => errorConfig[errorType];

  const showErrorHandover = (
    errorType: AddFundsErrorTypes,
    data?: Record<string, unknown>,
  ) => {
    page({
      userJourney: UserJourney.ADD_FUNDS,
      screen: 'Error',
      extras: {
        errorType,
        data,
      },
    });

    addHandover({
      animationUrl: getRemoteRive(environment, APPROVE_TXN_ANIMATION),
      inputValue: RiveStateMachineInput.ERROR,
      children: (
        <HandoverContent
          headingText={getErrorConfig(errorType).headingText}
          subheadingText={getErrorConfig(errorType).subHeadingText}
          primaryButtonText={getErrorConfig(errorType).primaryButtonText}
          onPrimaryButtonClick={getErrorConfig(errorType).onPrimaryButtonClick}
          secondaryButtonText={getErrorConfig(errorType).secondaryButtonText}
          onSecondaryButtonClick={
            getErrorConfig(errorType).onSecondaryButtonClick
          }
        />
      ),
    });
  };

  return {
    showErrorHandover,
  };
};

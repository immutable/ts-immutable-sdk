import { Environment } from '@imtbl/config';
import { useContext } from 'react';
import { AddTokensErrorTypes, RiveStateMachineInput } from '../types';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { getRemoteRive } from '../../../lib/utils';
import { APPROVE_TXN_ANIMATION } from '../utils/config';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { sendAddTokensCloseEvent } from '../AddTokensWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { AddTokensWidgetViews } from '../../../context/view-context/AddTokensViewContextTypes';
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
    sendAddTokensCloseEvent(eventTarget);
  };

  const goBackToAddTokensView = () => {
    closeHandover();

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: AddTokensWidgetViews.ADD_TOKENS,
        },
      },
    });
  };

  const errorConfig: Record<AddTokensErrorTypes, ErrorConfig> = {
    [AddTokensErrorTypes.DEFAULT]: {
      headingText: 'Sorry, something went wrong. Please try again later.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.INVALID_PARAMETERS]: {
      headingText: 'Invalid parameters',
      subHeadingText:
        'The widget parameters provided are invalid. Please check again.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.SERVICE_BREAKDOWN]: {
      headingText: 'Our system is currently down',
      subHeadingText:
        'We are currently experiencing technical difficulties. Please try again later.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.TRANSACTION_FAILED]: {
      headingText: 'Transaction failed',
      subHeadingText: 'The transaction failed. Please try again.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.UNRECOGNISED_CHAIN]: {
      headingText: 'Unrecognised chain',
      subHeadingText: 'Please add the chain to your account and try again.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.PROVIDER_ERROR]: {
      headingText: 'Wallet cannot be found',
      subHeadingText:
        'Please try to connect your wallet and try again.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.WALLET_FAILED]: {
      headingText: 'Transaction failed',
      subHeadingText: 'The transaction failed. Please try again.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: goBackToAddTokensView,
    },
    [AddTokensErrorTypes.WALLET_REJECTED]: {
      headingText: 'Transaction rejected',
      subHeadingText:
        "You'll need to approve the transaction in your wallet to proceed.",
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      headingText: 'Insufficient funds',
      subHeadingText:
        'You do not have enough funds to complete the transaction.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.WALLET_POPUP_BLOCKED]: {
      headingText: "Browser's popup blocked",
      subHeadingText: 'Please allow pop-ups in your browser to proceed.',
      primaryButtonText: 'Retry',
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: goBackToAddTokensView,
    },
    [AddTokensErrorTypes.ENVIRONMENT_ERROR]: {
      headingText: 'Unsupported environment',
      subHeadingText: 'This is only supported in production environment.',
      secondaryButtonText: 'Close',
      onSecondaryButtonClick: closeWidget,
    },
  };

  const getErrorConfig = (errorType: AddTokensErrorTypes) => errorConfig[errorType];

  const showErrorHandover = (
    errorType: AddTokensErrorTypes,
    data?: Record<string, unknown>,
  ) => {
    page({
      userJourney: UserJourney.ADD_TOKENS,
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

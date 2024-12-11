import { Environment } from '@imtbl/config';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      headingText: t('views.ADD_TOKENS.error.default.heading'),
      secondaryButtonText: t('views.ADD_TOKENS.error.default.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.INVALID_PARAMETERS]: {
      headingText: t('views.ADD_TOKENS.error.invalidParameters.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.invalidParameters.subHeading'),
      secondaryButtonText: t('views.ADD_TOKENS.error.invalidParameters.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.ROUTE_ERROR]: {
      headingText: t('views.ADD_TOKENS.error.routeError.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.routeError.subHeading'),
      secondaryButtonText: t('views.ADD_TOKENS.error.routeError.secondaryButtonText'),
      onSecondaryButtonClick: goBackToAddTokensView,
    },
    [AddTokensErrorTypes.SERVICE_BREAKDOWN]: {
      headingText: t('views.ADD_TOKENS.error.serviceBreakdown.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.serviceBreakdown.subHeading'),
      secondaryButtonText: t('views.ADD_TOKENS.error.serviceBreakdown.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.TRANSACTION_FAILED]: {
      headingText: t('views.ADD_TOKENS.error.transactionFailed.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.transactionFailed.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.transactionFailed.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.transactionFailed.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.UNRECOGNISED_CHAIN]: {
      headingText: t('views.ADD_TOKENS.error.unrecognisedChain.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.unrecognisedChain.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.unrecognisedChain.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.unrecognisedChain.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.PROVIDER_ERROR]: {
      headingText: t('views.ADD_TOKENS.error.providerError.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.providerError.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.providerError.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.providerError.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.WALLET_FAILED]: {
      headingText: t('views.ADD_TOKENS.error.walletFailed.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.walletFailed.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.walletFailed.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.walletFailed.secondaryButtonText'),
      onSecondaryButtonClick: goBackToAddTokensView,
    },
    [AddTokensErrorTypes.WALLET_REJECTED]: {
      headingText: t('views.ADD_TOKENS.error.walletRejected.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.walletRejected.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.walletRejected.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.walletRejected.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      headingText: t('views.ADD_TOKENS.error.walletRejectedNoFunds.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.walletRejectedNoFunds.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.walletRejectedNoFunds.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.walletRejectedNoFunds.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [AddTokensErrorTypes.WALLET_POPUP_BLOCKED]: {
      headingText: t('views.ADD_TOKENS.error.walletPopupBlocked.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.walletPopupBlocked.subHeading'),
      primaryButtonText: t('views.ADD_TOKENS.error.walletPopupBlocked.primaryButtonText'),
      onPrimaryButtonClick: goBackToAddTokensView,
      secondaryButtonText: t('views.ADD_TOKENS.error.walletPopupBlocked.secondaryButtonText'),
      onSecondaryButtonClick: goBackToAddTokensView,
    },
    [AddTokensErrorTypes.ENVIRONMENT_ERROR]: {
      headingText: t('views.ADD_TOKENS.error.environmentError.heading'),
      subHeadingText: t('views.ADD_TOKENS.error.environmentError.subHeading'),
      secondaryButtonText: t('views.ADD_TOKENS.error.environmentError.secondaryButtonText'),
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
        ...data,
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

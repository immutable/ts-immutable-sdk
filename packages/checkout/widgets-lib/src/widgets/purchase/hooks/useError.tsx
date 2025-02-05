import { Environment } from '@imtbl/config';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PurchaseErrorTypes } from '../types';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { sendPurchaseCloseEvent } from '../PurchaseWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { RiveStateMachineInput } from '../../../types/HandoverTypes';
import { useHandover } from '../../../lib/hooks/useHandover';
import { APPROVE_TXN_ANIMATION } from '../../../lib/squid/config';
import { getRemoteRive } from '../../../lib/utils';
import { PurchaseWidgetViews } from '../../../context/view-context/PurchaseViewContextTypes';

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
    sendPurchaseCloseEvent(eventTarget);
  };

  const goBackToPurchaseView = () => {
    closeHandover();

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: PurchaseWidgetViews.PURCHASE,
        },
      },
    });
  };

  const errorConfig: Record<PurchaseErrorTypes, ErrorConfig> = {
    [PurchaseErrorTypes.DEFAULT]: {
      headingText: t('views.PURCHASE.error.default.heading'),
      secondaryButtonText: t('views.PURCHASE.error.default.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.INVALID_PARAMETERS]: {
      headingText: t('views.PURCHASE.error.invalidParameters.heading'),
      subHeadingText: t('views.PURCHASE.error.invalidParameters.subHeading'),
      secondaryButtonText: t('views.PURCHASE.error.invalidParameters.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.ROUTE_ERROR]: {
      headingText: t('views.PURCHASE.error.routeError.heading'),
      subHeadingText: t('views.PURCHASE.error.routeError.subHeading'),
      secondaryButtonText: t('views.PURCHASE.error.routeError.secondaryButtonText'),
      onSecondaryButtonClick: goBackToPurchaseView,
    },
    [PurchaseErrorTypes.SERVICE_BREAKDOWN]: {
      headingText: t('views.PURCHASE.error.serviceBreakdown.heading'),
      subHeadingText: t('views.PURCHASE.error.serviceBreakdown.subHeading'),
      secondaryButtonText: t('views.PURCHASE.error.serviceBreakdown.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.TRANSACTION_FAILED]: {
      headingText: t('views.PURCHASE.error.transactionFailed.heading'),
      subHeadingText: t('views.PURCHASE.error.transactionFailed.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.transactionFailed.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.transactionFailed.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.UNRECOGNISED_CHAIN]: {
      headingText: t('views.PURCHASE.error.unrecognisedChain.heading'),
      subHeadingText: t('views.PURCHASE.error.unrecognisedChain.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.unrecognisedChain.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.unrecognisedChain.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.PROVIDER_ERROR]: {
      headingText: t('views.PURCHASE.error.providerError.heading'),
      subHeadingText: t('views.PURCHASE.error.providerError.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.providerError.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.providerError.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.WALLET_FAILED]: {
      headingText: t('views.PURCHASE.error.walletFailed.heading'),
      subHeadingText: t('views.PURCHASE.error.walletFailed.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.walletFailed.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.walletFailed.secondaryButtonText'),
      onSecondaryButtonClick: goBackToPurchaseView,
    },
    [PurchaseErrorTypes.WALLET_REJECTED]: {
      headingText: t('views.PURCHASE.error.walletRejected.heading'),
      subHeadingText: t('views.PURCHASE.error.walletRejected.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.walletRejected.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.walletRejected.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      headingText: t('views.PURCHASE.error.walletRejectedNoFunds.heading'),
      subHeadingText: t('views.PURCHASE.error.walletRejectedNoFunds.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.walletRejectedNoFunds.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.walletRejectedNoFunds.secondaryButtonText'),
      onSecondaryButtonClick: closeWidget,
    },
    [PurchaseErrorTypes.WALLET_POPUP_BLOCKED]: {
      headingText: t('views.PURCHASE.error.walletPopupBlocked.heading'),
      subHeadingText: t('views.PURCHASE.error.walletPopupBlocked.subHeading'),
      primaryButtonText: t('views.PURCHASE.error.walletPopupBlocked.primaryButtonText'),
      onPrimaryButtonClick: goBackToPurchaseView,
      secondaryButtonText: t('views.PURCHASE.error.walletPopupBlocked.secondaryButtonText'),
      onSecondaryButtonClick: goBackToPurchaseView,
    },
  };

  const getErrorConfig = (errorType: PurchaseErrorTypes) => errorConfig[errorType];

  const showErrorHandover = (
    errorType: PurchaseErrorTypes,
    data?: Record<string, unknown>,
  ) => {
    page({
      userJourney: UserJourney.PURCHASE,
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

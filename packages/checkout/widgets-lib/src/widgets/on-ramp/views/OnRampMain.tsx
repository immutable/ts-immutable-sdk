import { Passport } from '@imtbl/passport';
import { Box } from '@biom3/react';
import {
  useCallback,
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Checkout,
  ExchangeType, IMTBLWidgetEvents,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import url from 'url';
import { useTranslation } from 'react-i18next';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendOnRampWidgetCloseEvent } from '../OnRampWidgetEvents';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { OnRampWidgetViews } from '../../../context/view-context/OnRampViewContextTypes';
import { boxMainStyle, containerStyle } from './onRampStyles';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  TransakEventData,
  TransakEvents,
  TransakStatuses,
} from '../TransakEvents';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { TRANSAK_ORIGIN } from '../../../components/Transak/useTransakEvents';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { isPassportProvider } from '../../../lib/provider';

const transakIframeId = 'transak-iframe';
const IN_PROGRESS_VIEW_DELAY_MS = 6000; // 6 second
interface OnRampProps {
  showIframe: boolean;
  tokenAmount?: string;
  tokenAddress?: string;
  passport?: Passport;
  showBackButton?: boolean;
  showMenu?: boolean;
  customTitle?: string;
  customSubTitle?: string;
  showHeader?: boolean;
}

function useWidgetUrl(
  checkout: Checkout | undefined,
  provider: WrappedBrowserProvider | undefined,
  tokenAddress: string | undefined,
  tokenAmount: string | undefined,
  passport: Passport | undefined,
  showMenu: boolean | undefined,
  customSubTitle: string | undefined,
) {
  const [widgetUrl, setWidgetUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!checkout || !provider) return;

    const params = {
      exchangeType: ExchangeType.ONRAMP,
      browserProvider: provider,
      tokenAddress,
      tokenAmount,
      passport,
      showMenu,
      customSubTitle,
    };

    checkout.createFiatRampUrl(params).then(setWidgetUrl);
  }, [checkout, provider, tokenAddress, tokenAmount, passport, showMenu, customSubTitle]);

  return widgetUrl;
}

function useWalletAddress(provider: WrappedBrowserProvider | undefined) {
  const [userWalletAddress, setUserWalletAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!provider) return;
    provider.getSigner().then((signer) => signer.getAddress()).then(setUserWalletAddress);
  }, [provider]);

  return userWalletAddress;
}

export function OnRampMain({
  passport,
  showIframe,
  tokenAmount,
  tokenAddress,
  showBackButton,
  showMenu,
  customTitle,
  customSubTitle,
  showHeader = true,
}: OnRampProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { t } = useTranslation();
  const { viewState, viewDispatch } = useContext(ViewContext);
  const widgetUrl = useWidgetUrl(checkout, provider, tokenAddress, tokenAmount, passport, showMenu, customSubTitle);
  const userWalletAddress = useWalletAddress(provider);

  const eventTimer = useRef<number | undefined>();

  const isPassport = !!passport && isPassportProvider(provider);

  const openedFromTopUpView = useMemo(
    () => viewState.history.length > 2
      && viewState.history[viewState.history.length - 2].type
       === SharedViews.TOP_UP_VIEW,
    [viewState.history],
  );

  const showBack = showBackButton || openedFromTopUpView;

  const { track } = useAnalytics();

  const trackSegmentEvents = useCallback(async (
    event: TransakEventData,
    walletAddress: string,
  ) => {
    const miscProps = {
      userId: walletAddress.toLowerCase(),
      isPassportWallet: isPassport,
    };
    switch (event.event_id) {
      case TransakEvents.TRANSAK_WIDGET_OPEN:
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'InputScreen',
          control: 'TransakWidgetOpen',
          controlType: 'IframeEvent',
          extras: { ...miscProps },
        }); // checkoutOnRampInputScreen_TransakWidgetOpenIframeEvent
        break;
      case TransakEvents.TRANSAK_ORDER_CREATED:
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'InputScreen',
          control: 'OrderCreated',
          controlType: 'IframeEvent',
          extras: { ...miscProps },
        }); // checkoutOnRampInputScreen_OrderCreatedIframeEvent
        break;
      case TransakEvents.TRANSAK_ORDER_SUCCESSFUL:
        if (event.data.status === TransakStatuses.PROCESSING) {
          // user paid
          track({
            userJourney: UserJourney.ON_RAMP,
            screen: 'OrderInProgress',
            control: 'PaymentProcessing',
            controlType: 'IframeEvent',
            extras: {
              ...miscProps,
              transactionHash: event.data.transactionHash,
            },
          }); // checkoutOnRampOrderInProgress_PaymentProcessingIframeEvent
        }
        if (event.data.status === TransakStatuses.COMPLETED) {
          track({
            userJourney: UserJourney.ON_RAMP,
            screen: 'Success',
            control: 'PaymentCompleted',
            controlType: 'IframeEvent',
            extras: {
              ...miscProps,
              transactionHash: event.data.transactionHash,
            },
          }); // checkoutOnRampSuccess_PaymentCompletedIframeEvent
        }
        break;
      case TransakEvents.TRANSAK_ORDER_FAILED: // payment failed
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'Failure',
          control: 'PaymentFailed',
          controlType: 'IframeEvent',
          extras: { ...miscProps },
        }); // checkoutOnRampFailure_PaymentFailedIframeEvent
        break;
      default:
    }
  }, [isPassport, track]);

  const transakEventHandler = useCallback((event: TransakEventData) => {
    if (eventTimer.current) clearTimeout(eventTimer.current);

    if (event.event_id === TransakEvents.TRANSAK_WIDGET_OPEN) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.ONRAMP,
            data: {
              amount: viewState.view.data?.amount ?? tokenAmount,
              tokenAddress: viewState.view.data?.tokenAddress ?? tokenAddress,
            },
          },
        },
      });
      return;
    }

    if (
      event.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
      && event.data.status === TransakStatuses.PROCESSING
    ) {
      // this handles 3DS -- once the user has completed the verification,
      // kick off teh loading screen and then fake a IN_PROGRESS_VIEW_DELAY_MS
      // delay before showing the IN_PROGRESS screen
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.IN_PROGRESS_LOADING,
          },
        },
      });
      eventTimer.current = window.setTimeout(() => {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: OnRampWidgetViews.IN_PROGRESS,
            },
          },
        });
      }, IN_PROGRESS_VIEW_DELAY_MS);
      return;
    }

    if (
      event.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
      && event.data.status === TransakStatuses.COMPLETED
    ) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.SUCCESS,
            data: {
              transactionHash: event.data.transactionHash!,
            },
          },
        },
      });
      return;
    }

    if (event.event_id === TransakEvents.TRANSAK_ORDER_FAILED) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.FAIL,
            data: {
              amount: tokenAmount,
              tokenAddress,
            },
            reason: `Transaction failed: ${event.data.statusReason}`,
          },
        },
      });
    }
  }, [viewDispatch, tokenAmount, tokenAddress, viewState.view.data?.amount, viewState.view.data?.tokenAddress]);

  useEffect(() => {
    const domIframe = document.getElementById(
      transakIframeId,
    ) as HTMLIFrameElement | null;

    if (!domIframe) return;

    const handleTransakEvents = (event: any) => {
      const host = url.parse(event.origin)?.host?.toLowerCase();
      if (
        event.source === domIframe.contentWindow
        && host
        && TRANSAK_ORIGIN.includes(host)
      ) {
        trackSegmentEvents(event.data, userWalletAddress ?? '');
        transakEventHandler(event.data);
      }
    };

    window.addEventListener('message', handleTransakEvents);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('message', handleTransakEvents);
    };
  }, [trackSegmentEvents, transakEventHandler, userWalletAddress]);

  return (
    <Box sx={boxMainStyle(showIframe)}>
      <SimpleLayout
        header={showHeader ? (
          <HeaderNavigation
            title={customTitle ?? t('views.ONRAMP.header.title')}
            onCloseButtonClick={() => sendOnRampWidgetCloseEvent(eventTarget)}
            showBack={showBack}
            onBackButtonClick={() => {
              orchestrationEvents.sendRequestGoBackEvent(
                eventTarget,
                IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
                {},
              );
            }}
          />
        ) : undefined}
        footerBackgroundColor="base.color.translucent.emphasis.200"
      >
        <Box sx={containerStyle(showIframe)}>
          <iframe
            title="Transak"
            id={transakIframeId}
            src={widgetUrl}
            allow="camera;microphone;fullscreen;payment"
            style={{
              height: '100%',
              width: '100%',
              border: 'none',
              position: 'absolute',
            }}
          />
        </Box>
      </SimpleLayout>
    </Box>
  );
}

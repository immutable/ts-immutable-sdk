import { Passport } from '@imtbl/passport';
import { Box } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  ExchangeType, fetchRiskAssessment, IMTBLWidgetEvents, isAddressSanctioned,
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
}
export function OnRampMain({
  passport,
  showIframe,
  tokenAmount,
  tokenAddress,
  showBackButton,
}: OnRampProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { t } = useTranslation();
  const { viewState, viewDispatch } = useContext(ViewContext);
  const [widgetUrl, setWidgetUrl] = useState<string>('');

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

  const trackSegmentEvents = async (
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
  };

  const transakEventHandler = (event: TransakEventData) => {
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
  };

  useEffect(() => {
    if (!checkout || !provider) return;

    let userWalletAddress = '';

    (async () => {
      const walletAddress = await (await provider.getSigner()).getAddress();

      const assessment = await fetchRiskAssessment([walletAddress], checkout.config);

      if (isAddressSanctioned(assessment)) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
              error: new Error('Sanctioned address'),
            },
          },
        });

        return;
      }

      const params = {
        exchangeType: ExchangeType.ONRAMP,
        browserProvider: provider,
        tokenAddress,
        tokenAmount,
        passport,
      };

      setWidgetUrl(await checkout.createFiatRampUrl(params));
      userWalletAddress = await (await provider!.getSigner()).getAddress();
    })();

    const domIframe: HTMLIFrameElement = document.getElementById(
      transakIframeId,
    ) as HTMLIFrameElement;

    if (!domIframe) return;

    const handleTransakEvents = (event: any) => {
      if (!domIframe) return;

      const host = url.parse(event.origin)?.host?.toLowerCase();
      if (
        event.source === domIframe.contentWindow
        && host
        && TRANSAK_ORIGIN.includes(host)
      ) {
        trackSegmentEvents(event.data, userWalletAddress);
        transakEventHandler(event.data);
      }
    };
    window.addEventListener('message', handleTransakEvents);
  }, [checkout, provider, tokenAmount, tokenAddress, passport]);

  return (
    <Box sx={boxMainStyle(showIframe)}>
      <SimpleLayout
        header={(
          <HeaderNavigation
            title={t('views.ONRAMP.header.title')}
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
        )}
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

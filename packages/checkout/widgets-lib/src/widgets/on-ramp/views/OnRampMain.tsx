import { Passport } from '@imtbl/passport';
import { Box } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { ExchangeType } from '@imtbl/checkout-sdk';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendOnRampWidgetCloseEvent } from '../OnRampWidgetEvents';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { OnRampWidgetViews } from '../../../context/view-context/OnRampViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { boxMainStyle, containerStyle } from './onRampStyles';
import {
  AnalyticsControls,
  useAnalytics, UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { TransakEventData, TransakEvents, TransakStatuses } from '../TransakEvents';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

const transakIframeId = 'transak-iframe';
const transakOrigin = 'transak.com';
const IN_PROGRESS_VIEW_DELAY_MS = 1200;
interface OnRampProps {
  email?: string;
  showIframe: boolean;
  tokenAmount?: string;
  tokenAddress?: string;
  passport?: Passport;
}
export function OnRampMain({
  passport, email, showIframe, tokenAmount, tokenAddress,
}: OnRampProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { header } = text.views[OnRampWidgetViews.ONRAMP];
  const { viewState } = useContext(ViewContext);
  const { viewDispatch } = useContext(ViewContext);
  const [widgetUrl, setWidgetUrl] = useState<string>('');

  const isPassport = !!passport && (provider?.provider as any)?.isPassport;

  const showBackButton = useMemo(() => viewState.history.length > 2
    && viewState.history[viewState.history.length - 2].type === SharedViews.TOP_UP_VIEW, [viewState.history]);

  const { track } = useAnalytics();

  const trackSegmentEvents = async (eventData: any, walletAddress: string) => {
    const miscProps = {
      userId: walletAddress,
      isPassportWallet: isPassport,
      email,
    };
    switch (eventData.event_id) {
      case TransakEvents.TRANSAK_WIDGET_OPEN:
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'Initial-onramp-screen',
          control: AnalyticsControls.WEBHOOK_EVENT,
          controlType: 'Trigger',
          action: 'Opened',
          ...miscProps,
        });
        break;
      case TransakEvents.TRANSAK_ORDER_CREATED:
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'order-creation',
          control: AnalyticsControls.WEBHOOK_EVENT,
          controlType: 'Trigger',
          action: 'Started',
          ...miscProps,
        });
        break;
      case TransakEvents.TRANSAK_ORDER_SUCCESSFUL: // user paid
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'payment-confirmation',
          control: AnalyticsControls.CONFIRM,
          controlType: 'Button',
          action: 'Processing',
          ...miscProps,
        });
        break;
      case TransakEvents.TRANSAK_ORDER_FAILED: // payment failed
        track({
          userJourney: UserJourney.ON_RAMP,
          screen: 'failure-screen',
          control: AnalyticsControls.WEBHOOK_EVENT,
          controlType: 'Trigger',
          action: 'Failed',
          ...miscProps,
        });
        break;
      default:
    }
  };
  const transakEventHandler = (event: any) => {
    const eventData = event.data as TransakEventData;

    if (event.event_id === TransakEvents.TRANSAK_WIDGET_OPEN) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.ONRAMP,
            data: {
              amount: viewState.view.data?.amount ?? tokenAmount,
              contractAddress: viewState.view.data?.contractAddress ?? tokenAddress,
            },
          },
        },
      });
      return;
    }

    if (event.event_id === TransakEvents.TRANSAK_ORDER_CREATED) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.IN_PROGRESS_LOADING,
          },
        },
      });
      return;
    }

    if (event.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
      && eventData.status === TransakStatuses.PROCESSING) {
      setTimeout(() => {
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

    if (event.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
      && eventData.status === TransakStatuses.COMPLETED
    ) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.SUCCESS,
            data: {
              transactionHash: eventData.transactionHash!,
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
              contractAddress: tokenAddress,
            },
            reason: `Transaction failed: ${eventData.statusReason}`,
          },
        },
      });
    }
  };

  useEffect(() => {
    if (!checkout || !provider) return;

    let userWalletAddress = '';

    (async () => {
      const params = {
        exchangeType: ExchangeType.ONRAMP,
        web3Provider: provider,
        tokenAddress,
        tokenAmount,
        passport,
      };

      setWidgetUrl(await checkout.createFiatRampUrl(params));
      userWalletAddress = await provider!.getSigner().getAddress();
    })();

    const domIframe:HTMLIFrameElement = document.getElementById(transakIframeId) as HTMLIFrameElement;

    if (domIframe === undefined) return;

    const handleTransakEvents = (event: any) => {
      if (event.source === domIframe.contentWindow
        && event.origin.toLowerCase().includes(transakOrigin)) {
        trackSegmentEvents(event.data, userWalletAddress);
        transakEventHandler(event.data);
      }
    };
    window.addEventListener('message', handleTransakEvents);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('message', handleTransakEvents);
    };
  }, [checkout, provider, tokenAmount, tokenAddress, passport]);

  return (
    <Box sx={boxMainStyle(showIframe)}>
      <SimpleLayout
        header={(
          <HeaderNavigation
            showBack={showBackButton}
            title={header.title}
            onCloseButtonClick={() => sendOnRampWidgetCloseEvent(eventTarget)}
          />
        )}
        footerBackgroundColor="base.color.translucent.emphasis.200"
      >
        <Box sx={containerStyle(showIframe)}>
          <iframe
            title="Transak title"
            id={transakIframeId}
            src={widgetUrl}
            allow="camera;microphone;fullscreen;payment"
            style={{
              height: '100%', width: '100%', border: 'none', position: 'absolute',
            }}
          />
        </Box>
      </SimpleLayout>
    </Box>
  );
}

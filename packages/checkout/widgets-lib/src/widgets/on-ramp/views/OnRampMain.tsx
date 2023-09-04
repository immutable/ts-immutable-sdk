import { Passport } from '@imtbl/passport';
import { Box } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { BigNumber } from 'ethers';
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

const transakIframeId = 'transak-iframe';
const transakOrigin = 'transak.com';
interface OnRampProps {
  walletAddress?: string;
  email?: string;
  showIframe: boolean;
  tokenAmount?: string;
  tokenAddress?: string;
  passport?: Passport;
}
export function OnRampMain({
  walletAddress, passport, email, showIframe, tokenAmount, tokenAddress,
}: OnRampProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { header } = text.views[OnRampWidgetViews.ONRAMP];
  const { viewState } = useContext(ViewContext);
  const { viewDispatch } = useContext(ViewContext);
  const [widgetUrl, setWidgetUrl] = useState<string>('');

  const isPassport = !!passport && (provider?.provider as any)?.isPassport;

  const showBackButton = useMemo(() => viewState.history.length > 2
    && viewState.history[viewState.history.length - 2].type === SharedViews.TOP_UP_VIEW, [viewState.history]);

  const { track } = useAnalytics();

  const trackSegmentEvents = (eventData: any) => {
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

    if ((event.event_id === TransakEvents.TRANSAK_ORDER_CREATED)
      || (event.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
        && eventData.status === TransakStatuses.PROCESSING)
    ) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.IN_PROGRESS,
          },
        },
      });
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

    (async () => {
      const params = {
        exchangeType: ExchangeType.ONRAMP,
        web3Provider: provider,
        tokenAddress,
        tokenAmount: tokenAmount ? BigNumber.from(tokenAmount) : undefined,
        passport,
      };

      setWidgetUrl(await checkout.createCryptoFiatExchangeUrl(params));
    })();

    const domIframe:HTMLIFrameElement = document.getElementById(transakIframeId) as HTMLIFrameElement;

    if (domIframe === undefined) return;

    const handleTransakEvents = (event: any) => {
      if (event.source === domIframe.contentWindow
        && event.origin.toLowerCase().includes(transakOrigin)) {
        trackSegmentEvents(event.data);
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
            onCloseButtonClick={() => sendOnRampWidgetCloseEvent(window)}
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

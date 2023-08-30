import { Box } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { useContext, useEffect, useMemo } from 'react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendOnRampWidgetCloseEvent } from '../OnRampWidgetEvents';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { OnRampWidgetViews } from '../../../context/view-context/OnRampViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { boxMainStyle, containerStyle } from './onRampStyles';
import {
  useAnalytics,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { TransakEvents } from '../TransakEvents';

interface OnRampProps {
  environment: Environment;
  walletAddress?: string;
  email?: string;
  isPassport?: boolean;
  showIframe: boolean;
}
export function OnRampMain({
  environment, walletAddress, isPassport, email, showIframe,
}: OnRampProps) {
  const { header } = text.views[OnRampWidgetViews.ONRAMP];
  const { viewState } = useContext(ViewContext);
  const { viewDispatch } = useContext(ViewContext);

  const showBackButton = useMemo(() => viewState.history.length > 2
    && viewState.history[viewState.history.length - 2].type === SharedViews.TOP_UP_VIEW, [viewState.history]);

  const url = environment === Environment.SANDBOX
    ? 'https://global-stg.transak.com?apiKey=41ad2da7-ed5a-4d89-a90b-c751865effc2'
    : '';

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
          userJourney: 'OnRamp',
          screen: 'Initial-onramp-screen',
          control: 'WebhookEvent',
          controlType: 'Trigger',
          action: 'Opened',
          ...miscProps,
        });
        break;
      case TransakEvents.TRANSAK_ORDER_CREATED:
        track({
          userJourney: 'OnRamp',
          screen: 'order-creation',
          control: 'WebhookEvent',
          controlType: 'Trigger',
          action: 'Started',
          ...miscProps,
        });
        break;
      case TransakEvents.TRANSAK_ORDER_SUCCESSFUL: // user paid
        track({
          userJourney: 'OnRamp',
          screen: 'payment-confirmation',
          control: 'Confirm',
          controlType: 'Button',
          action: 'Processing',
          ...miscProps,
        });
        break;
      case TransakEvents.TRANSAK_ORDER_FAILED: // payment failed
        track({
          userJourney: 'OnRamp',
          screen: 'failure-screen',
          control: 'WebhookEvent',
          controlType: 'Trigger',
          action: 'Failed',
          ...miscProps,
        });
        break;
      default:
    }
  };

  useEffect(() => {
    const domIframe:HTMLIFrameElement = document.getElementById('transak-iframe') as HTMLIFrameElement;

    if (domIframe === undefined) return;

    const handler = (event: any) => {
      if (event.source === domIframe.contentWindow) {
        if (event.origin === 'https://global-stg.transak.com') {
          // eslint-disable-next-line no-console
          console.log('TRANSAK event data: ', event.data);
          trackSegmentEvents(event.data);

          if (event.data.event_id === TransakEvents.TRANSAK_ORDER_CREATED) {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: OnRampWidgetViews.IN_PROGRESS,
                },
              },
            });
          }

          if (event.data.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
            && event.data.data.status === 'PROCESSING') {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: OnRampWidgetViews.IN_PROGRESS,
                },
              },
            });
          }

          if (event.data.event_id === TransakEvents.TRANSAK_ORDER_SUCCESSFUL
            && event.data.data.status === 'COMPLETED'
          ) {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: OnRampWidgetViews.SUCCESS,
                },
              },
            });
          }

          if (event.data.event_id === TransakEvents.TRANSAK_ORDER_FAILED) {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: OnRampWidgetViews.FAIL,
                },
              },
            });
          }
        }
      }
    };
    window.addEventListener('message', handler);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <Box sx={boxMainStyle(showIframe)}>
      <SimpleLayout
        header={(
          <HeaderNavigation
            showBack={showBackButton}
            title={header.title}
            onCloseButtonClick={() => sendOnRampWidgetCloseEvent()}
          />
        )}
        footerBackgroundColor="base.color.translucent.emphasis.200"
      >
        <Box sx={containerStyle(showIframe)}>
          <iframe
            title="Transak title"
            id="transak-iframe"
            src={url}
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

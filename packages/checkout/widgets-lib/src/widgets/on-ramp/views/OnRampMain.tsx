import { Box } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { useEffect } from 'react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendOnRampWidgetCloseEvent } from '../OnRampWidgetEvents';
import { getSegmentWriteKey, useAnalytics } from '../../../context/SegmentAnalyticsProvider';

interface OnRampProps {
  environment: Environment
}
export function OnRampMain({ environment }: OnRampProps) {
  const url = environment === Environment.SANDBOX
    ? 'https://global-stg.transak.com?apiKey=41ad2da7-ed5a-4d89-a90b-c751865effc2'
    : '';

  const configurations = 'exchangeScreenTitle=BUY';

  const finalUrl = `${url}&${configurations}`;

  const { track, updateWriteKey } = useAnalytics();

  const trackSegmentEvents = (event: any) => {
    switch (event.event_id) {
      case 'TRANSAK_WIDGET_OPEN':
        track({
          userJourney: 'OnRamp',
          screen: 'Initial-onramp-screen',
          control: 'WebhookEvent',
          controlType: 'Trigger',
          action: 'Opened',
          userId: '0x00address00', // todo: insert wallet-address
        });
        break;
      case 'TRANSAK_ORDER_CREATED': // AWAITING_PAYMENT_FROM_USER
        track({
          userJourney: 'OnRamp',
          screen: 'order-creation',
          control: 'WebhookEvent',
          controlType: 'Trigger',
          action: 'Started',
          userId: '0x00address00', // todo: insert wallet-address
        });
        break;
      case 'TRANSAK_ORDER_SUCCESSFUL': // user paid
        track({
          userJourney: 'OnRamp',
          screen: 'payment-confirmation',
          control: 'Confirm',
          controlType: 'Button',
          action: 'Processing',
          userId: '0x00address00', // todo: insert wallet-address
        });
        break;
      case 'TRANSAK_ORDER_FAILED': // payment failed
        track({
          userJourney: 'OnRamp',
          screen: 'failure-screen',
          control: 'WebhookEvent',
          controlType: 'Trigger',
          action: 'Failed',
          userId: '0x00address00', // todo: insert wallet-address
        });
        break;
      default:
    }
  };

  useEffect(() => {
    const domIframe:HTMLIFrameElement = document.getElementById('transak-iframe') as HTMLIFrameElement;

    if (domIframe === undefined) return;

    updateWriteKey(getSegmentWriteKey(environment));

    const handler = (event: any) => {
      if (event.source === domIframe.contentWindow) {
        if (event.origin === 'https://global-stg.transak.com') {
          // eslint-disable-next-line no-console
          console.log('TRANSAK event data: ', event.data);
          trackSegmentEvents(event);
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
    <SimpleLayout
      header={(
        <HeaderNavigation
          title="Add coins"
          onCloseButtonClick={() => sendOnRampWidgetCloseEvent()}
        />
        )}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <Box style={{
        position: 'relative',
        width: '420px',
        height: '565px',
        boxShadow: '0 0 15px #1461db',
        borderRadius: '15px',
        overflow: 'hidden',
        marginLeft: '5px',
      }}
      >
        <iframe
          title="Transak title"
          id="transak-iframe"
          src={finalUrl}
          allow="camera;microphone;fullscreen;payment"
          style={{ height: '100%', width: '100%', border: 'none' }}
        />
      </Box>
    </SimpleLayout>
  );
}

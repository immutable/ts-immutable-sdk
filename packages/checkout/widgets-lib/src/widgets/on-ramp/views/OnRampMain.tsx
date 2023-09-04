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
import { SharedViews, ViewContext } from '../../../context/view-context/ViewContext';
import { OnRampWidgetViews } from '../../../context/view-context/OnRampViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { containerStyle } from './onRampStyles';
import {
  useAnalytics,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { TransakEvents } from '../TransakEvents';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';

interface OnRampProps {
  walletAddress?: string;
  email?: string;
  tokenAmount?: string;
  tokenAddress?: string;
  passport?: Passport;
}
export function OnRampMain({
  walletAddress, email, tokenAmount, tokenAddress, passport,
}: OnRampProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { header } = text.views[OnRampWidgetViews.ONRAMP];
  const { viewState } = useContext(ViewContext);
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

    const domIframe:HTMLIFrameElement = document.getElementById('transak-iframe') as HTMLIFrameElement;

    if (domIframe === undefined) return;

    const handler = (event: any) => {
      if (event.source === domIframe.contentWindow) {
        if (event.origin === 'https://global-stg.transak.com') {
          // eslint-disable-next-line no-console
          console.log('TRANSAK event data: ', event.data);
          trackSegmentEvents(event.data);
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
          showBack={showBackButton}
          title={header.title}
          onCloseButtonClick={() => sendOnRampWidgetCloseEvent()}
        />
        )}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <Box sx={containerStyle}>
        <iframe
          title="Transak title"
          id="transak-iframe"
          src={widgetUrl}
          allow="camera;microphone;fullscreen;payment"
          style={{
            height: '100%', width: '100%', border: 'none', position: 'absolute',
          }}
        />
      </Box>
    </SimpleLayout>
  );
}

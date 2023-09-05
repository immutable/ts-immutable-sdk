import { useCallback, useContext } from 'react';
import { TokenFilterTypes } from '@imtbl/checkout-sdk';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeForm } from '../components/BridgeForm';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import { useInterval } from '../../../lib/hooks/useInterval';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { getAllowedBalances } from '../../../lib/balance';

const REFRESH_TOKENS_INTERVAL_MS = 10000;

export interface BridgeProps {
  amount: string | undefined;
  fromContractAddress: string | undefined;
}

export function Bridge({ amount, fromContractAddress }: BridgeProps) {
  const { header } = text.views[BridgeWidgetViews.BRIDGE];
  const { bridgeDispatch } = useContext(BridgeContext);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  // This is used to refresh the balances after the Bridge widget
  // has been loaded so that processing transfers will be eventually
  // reflected.
  const refreshBalances = useCallback(async () => {
    if (!checkout) return;
    if (!provider) return;

    try {
      const tokensAndBalances = await getAllowedBalances({
        checkout,
        provider,
        allowTokenListType: TokenFilterTypes.BRIDGE,
        allowNative: true,
        retryPolicy: { retryIntervalMs: 0, retries: 0 },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_BALANCES,
          tokenBalances: tokensAndBalances.allowedBalances,
        },
      });
      // Ignore errors given that this is a background refresh
      // and the logic will retry anyways.
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.debug(e);
    }
  }, [checkout, provider]);
  useInterval(refreshBalances, REFRESH_TOKENS_INTERVAL_MS);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          title={header.title}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <BridgeForm
        testId="bridge-form"
        defaultAmount={amount}
        defaultFromContractAddress={fromContractAddress}
      />
    </SimpleLayout>
  );
}

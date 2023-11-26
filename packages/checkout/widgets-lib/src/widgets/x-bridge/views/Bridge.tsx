import { useCallback, useContext } from 'react';
import { TokenFilterTypes } from '@imtbl/checkout-sdk';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeForm } from '../components/BridgeForm';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { BridgeActions, XBridgeContext } from '../context/XBridgeContext';
import { useInterval } from '../../../lib/hooks/useInterval';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { getAllowedBalances } from '../../../lib/balance';

const REFRESH_TOKENS_INTERVAL_MS = 10000;

export interface BridgeProps {
  amount?: string;
  fromContractAddress?: string;
}

export function Bridge({ amount, fromContractAddress }: BridgeProps) {
  const { header } = text.views[BridgeWidgetViews.BRIDGE];
  const { bridgeState, bridgeDispatch } = useContext(XBridgeContext);
  const { checkout, web3Provider } = bridgeState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  // This is used to refresh the balances after the Bridge widget
  // has been loaded so that processing transfers will be eventually
  // reflected.
  const refreshBalances = useCallback(async () => {
    if (!checkout || !web3Provider) return;

    try {
      const tokensAndBalances = await getAllowedBalances({
        checkout,
        provider: web3Provider,
        allowTokenListType: TokenFilterTypes.BRIDGE,
        // Skip retry given that in this case it is not needed;
        // refreshBalances will be, automatically, called again
        // after REFRESH_TOKENS_INTERVAL_MS.
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
  }, [checkout, web3Provider]);
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

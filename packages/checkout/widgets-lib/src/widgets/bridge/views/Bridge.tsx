import { useCallback, useContext } from 'react';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeForm } from '../components/BridgeForm';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import { getBridgeTokensAndBalances } from '../functions/getBridgeTokens';
import { useInterval } from '../../../lib/hooks/useInterval';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

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

  const refreshBalances = useCallback(async () => {
    if (!checkout) return;
    if (!provider) return;

    const tokensAndBalances = await getBridgeTokensAndBalances(checkout, provider);

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_TOKEN_BALANCES,
        tokenBalances: tokensAndBalances.allowedTokenBalances,
      },
    });
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

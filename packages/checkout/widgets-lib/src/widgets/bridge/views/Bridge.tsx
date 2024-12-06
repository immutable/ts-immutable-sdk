import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { TokenFilterTypes, WidgetTheme } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeForm } from '../components/BridgeForm';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import { useInterval } from '../../../lib/hooks/useInterval';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { getAllowedBalances } from '../../../lib/balance';

const REFRESH_TOKENS_INTERVAL_MS = 10000;

export interface BridgeProps {
  amount?: string;
  tokenAddress?: string;
  defaultTokenImage: string;
  theme: WidgetTheme;
}

export function Bridge({
  amount,
  tokenAddress,
  defaultTokenImage,
  theme,
}: BridgeProps) {
  const { t } = useTranslation();
  const { bridgeState, bridgeDispatch } = useContext(BridgeContext);
  const { checkout, from } = bridgeState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const [isTokenBalancesLoading, setIsTokenBalancesLoading] = useState(false);
  const showBackButton = true;

  const { page } = useAnalytics();

  useEffect(() => {
    if (amount || tokenAddress) {
      page({
        userJourney: UserJourney.BRIDGE,
        screen: 'TokenAmount',
        extras: {
          amount,
          tokenAddress,
        },
      });
    }
  }, []);

  // This is used to refresh the balances after the Bridge widget
  // has been loaded so that processing transfers will be eventually
  // reflected.
  const refreshBalances = useCallback(async () => {
    if (!checkout || !from?.browserProvider) return;
    try {
      const tokensAndBalances = await getAllowedBalances({
        checkout,
        provider: from.browserProvider,
        chainId: from?.network,
        allowTokenListType: TokenFilterTypes.BRIDGE,
        // Skip retry given that in this case it is not needed;
        // refreshBalances will be, automatically, called again
        // after REFRESH_TOKENS_INTERVAL_MS.
        retryPolicy: { retryIntervalMs: 0, retries: 0 },
      });

      // Why? Check getAllowedBalances
      if (tokensAndBalances === undefined) return;

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_BALANCES,
          tokenBalances: tokensAndBalances.allowedBalances,
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_ALLOWED_TOKENS,
          allowedTokens: tokensAndBalances.allowList.tokens,
        },
      });

      // Ignore errors given that this is a background refresh
      // and the logic will retry anyways.
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.debug(e);
    }
  }, [checkout, from?.browserProvider, from?.network]);
  useInterval(refreshBalances, REFRESH_TOKENS_INTERVAL_MS);

  useEffect(() => {
    if (!checkout || !from?.browserProvider) return;
    setIsTokenBalancesLoading(true);
    refreshBalances().finally(() => setIsTokenBalancesLoading(false));
  }, [checkout, from?.browserProvider]);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack={showBackButton}
          title={t('views.BRIDGE_FORM.header.title')}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <BridgeForm
        testId="bridge-form"
        defaultAmount={amount}
        defaultTokenAddress={tokenAddress}
        isTokenBalancesLoading={isTokenBalancesLoading}
        defaultTokenImage={defaultTokenImage}
        environment={checkout?.config.environment}
        theme={theme}
      />
    </SimpleLayout>
  );
}

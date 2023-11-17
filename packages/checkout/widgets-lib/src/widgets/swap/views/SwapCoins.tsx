import { Box } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { QuickswapFooter } from '../../../components/Footer/QuickswapFooter';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { hasZeroBalance } from '../../../lib/gasBalanceCheck';
import { SwapContext } from '../context/SwapContext';
import { NotEnoughImx } from '../../../components/NotEnoughImx/NotEnoughImx';
import { IMX_TOKEN_SYMBOL } from '../../../lib';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export interface SwapCoinsProps {
  theme: WidgetTheme;
  fromAmount?: string;
  toAmount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapCoins({
  theme,
  fromAmount,
  toAmount,
  fromContractAddress,
  toContractAddress,
}: SwapCoinsProps) {
  const { header } = text.views[SwapWidgetViews.SWAP];
  const { viewState, viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const showBackButton = useMemo(() => viewState.history.length > 2
  && viewState.history[viewState.history.length - 2].type === SharedViews.TOP_UP_VIEW, [viewState.history]);

  const {
    swapState: {
      tokenBalances,
    },
  } = useContext(SwapContext);

  const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = useState(false);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.SWAP,
      screen: 'SwapCoins',
      extras: {
        fromAmount,
        toAmount,
        fromContractAddress,
        toContractAddress,
      },
    });
  }, []);

  useEffect(() => {
    if (hasZeroBalance(tokenBalances, IMX_TOKEN_SYMBOL)) {
      setShowNotEnoughImxDrawer(true);
    }
  }, [tokenBalances]);

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack={showBackButton}
          title={header.title}
          onCloseButtonClick={() => sendSwapWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<QuickswapFooter theme={theme} />}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <SwapForm data={{
          fromAmount,
          toAmount,
          fromContractAddress,
          toContractAddress,
        }}
        />
        <NotEnoughImx
          visible={showNotEnoughImxDrawer}
          showAdjustAmount={false}
          hasZeroImx
          onAddCoinsClick={() => {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: SharedViews.TOP_UP_VIEW,
                },
              },
            });
          }}
          onCloseBottomSheet={() => {
            setShowNotEnoughImxDrawer(false);
          }}
        />
      </Box>
    </SimpleLayout>
  );
}

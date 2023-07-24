import { Box } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { hasZeroBalance } from '../../../lib/gasBalanceCheck';
import { SwapContext } from '../context/SwapContext';
import { NotEnoughImx } from '../../../components/NotEnoughImx/NotEnoughImx';
import { IMX_TOKEN_SYMBOL } from '../../../lib';

export interface SwapCoinsProps {
  fromAmount?: string;
  toAmount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapCoins({
  fromAmount,
  toAmount,
  fromContractAddress,
  toContractAddress,
}: SwapCoinsProps) {
  const { header } = text.views[SwapWidgetViews.SWAP];
  const { viewState, viewDispatch } = useContext(ViewContext);

  const showBackButton = useMemo(() => viewState.history.length > 2
  && viewState.history[viewState.history.length - 2].type === SharedViews.TOP_UP_VIEW, [viewState.history]);

  const {
    swapState: {
      tokenBalances,
    },
  } = useContext(SwapContext);

  const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = useState(false);

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
          onCloseButtonClick={() => sendSwapWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
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

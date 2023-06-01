import {
  Box, Heading, MenuItem,
} from '@biom3/react';
import {
  IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';
import { useContext } from 'react';
import { FooterLogo } from '../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { SharedViews, ViewActions, ViewContext } from '../../context/view-context/ViewContext';
import { text } from '../../resources/text/textConfig';
import {
  orchestrationEvents,
} from '../../lib/orchestrationEvents';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';

interface TopUpViewProps {
  widgetEvent: IMTBLWidgetEvents,
  showOnrampOption: boolean,
  showSwapOption: boolean,
  showBridgeOption: boolean,
  tokenAddress?: string,
  amount?: string,
  onCloseButtonClick: () => void,
  onBackButtonClick?: () => void,
}

export function TopUpView({
  widgetEvent,
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  tokenAddress,
  amount,
  onCloseButtonClick,
  onBackButtonClick,
}: TopUpViewProps) {
  const { header, topUpOptions } = text.views[SharedViews.TOP_UP_VIEW];
  const { onramp, swap, bridge } = topUpOptions;
  const { viewDispatch } = useContext(ViewContext);

  const onClickOnramp = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT) {
      // dispatch onramp view
    }
    orchestrationEvents.sendRequestOnrampEvent(widgetEvent, {
      tokenAddress: tokenAddress ?? '',
      amount: amount ?? '',
    });
  };

  const onClickSwap = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.SWAP,
            data: {
              toContractAddress: tokenAddress ?? '',
              fromAmount: '',
              fromContractAddress: '',
            },
          },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestSwapEvent(widgetEvent, {
      fromTokenAddress: '',
      toTokenAddress: tokenAddress ?? '',
      amount: '',
    });
  };

  const renderMenuItem = (
    testId: string,
    icon: 'Wallet' | 'Coins' | 'Minting',
    heading: string,
    caption: string,
    subcaption: string,
    onClick: () => void,
  ) => (
    <Box sx={{ paddingY: '1px' }}>
      <MenuItem
        testId={`menu-item-${testId}`}
        size="medium"
        emphasized
        onClick={onClick}
      >
        <MenuItem.Icon
          icon={icon}
        />
        <MenuItem.Label size="medium">
          {heading}
        </MenuItem.Label>
        <MenuItem.IntentIcon />
        <MenuItem.Caption>
          {caption}
          <br />
          {subcaption}
        </MenuItem.Caption>
      </MenuItem>
    </Box>
  );

  const onClickBridge = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.BRIDGE },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestBridgeEvent(widgetEvent, {
      tokenAddress: '',
      amount: '',
    });
  };

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          onBackButtonClick={onBackButtonClick ?? undefined}
          onCloseButtonClick={onCloseButtonClick}
          showBack
        />
      )}
      footer={(
        <FooterLogo />
      )}
    >
      <Box sx={{ paddingX: 'base.spacing.x4', paddingY: 'base.spacing.x4' }}>
        <Heading size="small">{header.title}</Heading>
        <Box sx={{ paddingY: 'base.spacing.x4' }}>
          {showOnrampOption && renderMenuItem(
            'onramp',
            'Wallet',
            onramp.heading,
            onramp.caption,
            onramp.subcaption,
            onClickOnramp,
          )}
          {showSwapOption && renderMenuItem(
            'swap',
            'Coins',
            swap.heading,
            swap.caption,
            swap.subcaption,
            onClickSwap,
          )}
          {showBridgeOption && renderMenuItem(
            'bridge',
            'Minting',
            bridge.heading,
            bridge.caption,
            bridge.subcaption,
            onClickBridge,
          )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}

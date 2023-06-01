import {
  Box, Heading, MenuItem,
} from '@biom3/react';
import {
  IMTBLWidgetEvents, RequestBridgeEvent, RequestOnrampEvent, RequestSwapEvent,
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

enum CurrentWidget {
  ONRAMP = 'ONRAMP',
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE',
}

interface TopUpViewProps {
  showOnrampOption: boolean,
  showSwapOption: boolean,
  showBridgeOption: boolean,
  currentWidget?: CurrentWidget,
  onrampEventData?: RequestOnrampEvent,
  swapEventData?: RequestSwapEvent,
  bridgeEventData?: RequestBridgeEvent,
  onBackButtonClick?: () => void,
  onCloseButtonClick: () => void,
}

export function TopUpView({
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  currentWidget,
  onrampEventData,
  swapEventData,
  bridgeEventData,
  onBackButtonClick,
  onCloseButtonClick,
}: TopUpViewProps) {
  const { header, topUpOptions } = text.views[SharedViews.TOP_UP_VIEW];
  const { card, swap, bridge } = topUpOptions;
  const { viewDispatch } = useContext(ViewContext);

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
            card.heading,
            card.caption,
            card.subcaption,
            () => {
              if (currentWidget === CurrentWidget.ONRAMP) {
                // dispatch onramp view
              }
              orchestrationEvents.sendRequestOnrampEvent(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                tokenAddress: onrampEventData?.tokenAddress ?? '',
                amount: onrampEventData?.amount ?? '',
              });
            },
          )}
          {showSwapOption && renderMenuItem(
            'swap',
            'Coins',
            swap.heading,
            swap.caption,
            swap.subcaption,
            () => {
              if (currentWidget === CurrentWidget.SWAP) {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: SwapWidgetViews.SWAP },
                  },
                });
                return;
              }
              orchestrationEvents.sendRequestSwapEvent(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                fromTokenAddress: swapEventData?.fromTokenAddress ?? '',
                toTokenAddress: swapEventData?.toTokenAddress ?? '',
                amount: swapEventData?.amount ?? '',
              });
            },
          )}
          {showBridgeOption && renderMenuItem(
            'bridge',
            'Minting',
            bridge.heading,
            bridge.caption,
            bridge.subcaption,
            () => {
              if (currentWidget === CurrentWidget.BRIDGE) {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: BridgeWidgetViews.BRIDGE },
                  },
                });
                return;
              }
              orchestrationEvents.sendRequestBridgeEvent(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                tokenAddress: bridgeEventData?.tokenAddress ?? '',
                amount: bridgeEventData?.amount ?? '',
              });
            },
          )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}

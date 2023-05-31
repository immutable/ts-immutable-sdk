import {
  Box, Heading, MenuItem,
} from '@biom3/react';
import { FooterLogo } from '../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { SharedViews } from '../../context/view-context/ViewContext';
import { text } from '../../resources/text/textConfig';

interface TopUpViewProps {
  showOnrampOption: boolean,
  showSwapOption: boolean,
  showBridgeOption: boolean,
  onBackButtonClick?: () => void,
  onCloseButtonClick: () => void,
}

export function TopUpView({
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  onBackButtonClick,
  onCloseButtonClick,
}: TopUpViewProps) {
  const { header, topUpOptions } = text.views[SharedViews.TOP_UP_VIEW];
  const { card, swap, bridge } = topUpOptions;

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
              console.log('fire show onramp widget event');
              // sendRequestOnrampEvent();
            },
          )}
          {showSwapOption && renderMenuItem(
            'swap',
            'Coins',
            swap.heading,
            swap.caption,
            swap.subcaption,
            () => {
              console.log('fire show swap widget event');
              // sendRequestSwapEvent();
            },
          )}
          {showBridgeOption && renderMenuItem(
            'bridge',
            'Minting',
            bridge.heading,
            bridge.caption,
            bridge.subcaption,
            () => {
              console.log('fire show bridge widget event');
              // sendRequestBridgeEvent();
            },
          )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}

import {
  Body,
  Box, Button, CloudImage, Drawer, Heading,
} from '@biom3/react';
import { CHECKOUT_CDN_BASE_URL, ETH_TOKEN_SYMBOL } from 'lib';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { BridgeContext } from 'widgets/bridge/context/BridgeContext';
import {
  actionButtonContainerStyles, actionButtonStyles, containerStyles, contentTextStyles,
} from './NotEnoughEthToWithdrawStyles';

export interface NotEnoughEthToWithdrawProps {
  visible: boolean,
  onClose: () => void,
  onChangeAccount: () => void,
}

export function NotEnoughEthToWithdraw({
  visible,
  onClose,
  onChangeAccount,
}: NotEnoughEthToWithdrawProps) {
  const { t } = useTranslation();
  const { bridgeState: { checkout } } = useContext(BridgeContext);
  const ethLogo = `${CHECKOUT_CDN_BASE_URL[checkout.config.environment]}/v1/blob/img/tokens/eth.svg`;

  return (
    <Drawer
      headerBarTitle={undefined}
      size="full"
      onCloseDrawer={onClose}
      visible={visible}
      showHeaderBar={false}
    >

      <Drawer.Content>
        <Box testId="not-enough-eth-drawer" sx={containerStyles}>
          <CloudImage imageUrl={ethLogo} sx={{ w: 'base.icon.size.600', h: 'base.icon.size.600' }} />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="not-enough-gas-heading"
          >
            {/* eslint-disable-next-line max-len */}
            {`${t('drawers.notEnoughEthWithdrawal.content.heading1')} ${ETH_TOKEN_SYMBOL} ${t('drawers.notEnoughEthWithdrawal.content.heading2')}`}
          </Heading>
          <Body sx={contentTextStyles}>
            {/* eslint-disable-next-line max-len */}
            {`${t('drawers.notEnoughEthWithdrawal.content.body1')} ${ETH_TOKEN_SYMBOL} ${t('drawers.notEnoughEthWithdrawal.content.body2')}`}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            <Button
              testId="not-enough-eth-drawer-retry-button"
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onChangeAccount}
            >
              {t('drawers.notEnoughEthWithdrawal.buttons.retry')}
            </Button>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onClose}
              testId="not-enough-eth-drawer-dismiss-button"
            >
              {t('drawers.notEnoughEthWithdrawal.buttons.dismiss')}
            </Button>
          </Box>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

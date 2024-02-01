import {
  Body,
  Box, Button, CloudImage, Drawer, Heading,
} from '@biom3/react';
import { CHECKOUT_CDN_BASE_URL } from 'lib';
import { Environment } from '@imtbl/config';
import { useTranslation } from 'react-i18next';
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
  const ethLogo = `${CHECKOUT_CDN_BASE_URL[Environment.PRODUCTION]}/v1/blob/img/tokens/eth.svg`;

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
            {`${t('drawers.notEnoughEthWithdrawal.content.heading1')} ETH ${t('drawers.notEnoughEthWithdrawal.content.heading2')}`}
          </Heading>
          <Body sx={contentTextStyles}>
            {/* eslint-disable-next-line max-len */}
            {`${t('drawers.notEnoughEthWithdrawal.content.body1')} ETH ${t('drawers.notEnoughEthWithdrawal.content.body2')}`}
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

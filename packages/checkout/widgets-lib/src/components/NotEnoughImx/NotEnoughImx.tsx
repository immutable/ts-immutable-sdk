import {
  Body,
  Drawer, Box, Button, Heading, Logo, CloudImage,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { CHECKOUT_CDN_BASE_URL } from '@imtbl/checkout-sdk/dist/env';
import { Environment } from '@imtbl/config';
import {
  containerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
  logoContainerStyles,
} from './NotEnoughImxStyles';

type NotEnoughImxProps = {
  visible: boolean;
  showAdjustAmount: boolean;
  hasZeroImx: boolean;
  onCloseDrawer?: () => void;
  onAddCoinsClick: () => void;
};

export function NotEnoughImx({
  visible, showAdjustAmount, hasZeroImx, onCloseDrawer, onAddCoinsClick,
}: NotEnoughImxProps) {
  const { t } = useTranslation();

  const imxLogo = `${CHECKOUT_CDN_BASE_URL[Environment.PRODUCTION]}/v1/blob/img/tokens/imx.svg`;

  return (
    <Drawer
      size="full"
      onCloseDrawer={onCloseDrawer}
      visible={visible}
      showHeaderBar={false}
    >
      <Drawer.Content>
        <Box testId="not-enough-gas-bottom-sheet" sx={containerStyles}>
          <CloudImage
            imageUrl={imxLogo}
            sx={{ w: 'base.icon.size.600', h: 'base.icon.size.600' }}
          />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="not-enough-gas-heading"
          >
            {t(`drawers.notEnoughImx.content.${hasZeroImx ? 'noImx' : 'insufficientImx'}.heading`)}
          </Heading>
          <Body sx={contentTextStyles}>
            {t(`drawers.notEnoughImx.content.${hasZeroImx ? 'noImx' : 'insufficientImx'}.body`)}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            {showAdjustAmount && (
              <Button
                testId="not-enough-gas-adjust-amount-button"
                sx={actionButtonStyles}
                variant="tertiary"
                onClick={onCloseDrawer}
              >
                {t('drawers.notEnoughImx.buttons.adjustAmount')}
              </Button>
            )}
            <Button
              testId="not-enough-gas-add-imx-button"
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onAddCoinsClick}
            >
              {t('drawers.notEnoughImx.buttons.addMoreImx')}
            </Button>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseDrawer}
              testId="not-enough-gas-cancel-button"
            >
              {t('drawers.notEnoughImx.buttons.cancel')}
            </Button>
          </Box>
          <Box sx={logoContainerStyles}>
            <Logo
              testId="footer-logo-image"
              logo="ImmutableHorizontalLockup"
              sx={{ width: 'base.spacing.x25' }}
            />
          </Box>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

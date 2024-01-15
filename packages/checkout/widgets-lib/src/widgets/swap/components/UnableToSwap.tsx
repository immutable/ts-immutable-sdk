import {
  Body, Drawer, Box, Button, Heading, Icon, Logo,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  containerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
  logoContainerStyles,
  statusStyles,
} from './UnableToSwapStyles';

type UnableToSwapProps = {
  visible: boolean;
  onCloseDrawer: () => void;
};

export function UnableToSwap({ visible, onCloseDrawer }: UnableToSwapProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      size="full"
      onCloseDrawer={onCloseDrawer}
      visible={visible}
      showHeaderBar={false}
    >
      <Drawer.Content>
        <Box testId="unable-to-swap-bottom-sheet" sx={containerStyles}>
          <Icon
            icon="Alert"
            testId="unable-to-swap-icon"
            variant="bold"
            sx={statusStyles}
          />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="unable-to-swap-heading"
          >
            {t('drawers.unableToSwap.heading')}
          </Heading>
          <Body sx={contentTextStyles}>
            {t('drawers.unableToSwap.body')}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseDrawer}
              testId="unable-to-swap-cancel-button"
            >
              {t('drawers.unableToSwap.buttons.cancel')}
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

import {
  Body, Drawer, Box, Button, Heading, Icon, Logo,
} from '@biom3/react';
import {
  containerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
  logoContainerStyles,
  statusStyles,
} from './UnableToSwapStyles';
import { text } from '../../../resources/text/textConfig';

type UnableToSwapProps = {
  visible: boolean;
  onCloseDrawer: () => void;
};

export function UnableToSwap({ visible, onCloseDrawer }: UnableToSwapProps) {
  const { heading, body, buttons } = text.drawers.unableToSwap;

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
            {heading}
          </Heading>
          <Body sx={contentTextStyles}>
            {body}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseDrawer}
              testId="unable-to-swap-cancel-button"
            >
              {buttons.cancel}
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

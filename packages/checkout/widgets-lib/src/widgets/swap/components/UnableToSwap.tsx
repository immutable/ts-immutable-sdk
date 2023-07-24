import {
  Body, BottomSheet, Box, Button, Heading, Icon, Logo,
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
  onCloseBottomSheet: () => void;
};

export function UnableToSwap({ visible, onCloseBottomSheet }: UnableToSwapProps) {
  const { heading, body, buttons } = text.drawers.unableToSwap;

  return (
    <BottomSheet
      size="full"
      onCloseBottomSheet={onCloseBottomSheet}
      visible={visible}
      showHeaderBar={false}
    >
      <BottomSheet.Content>
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
              onClick={onCloseBottomSheet}
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
      </BottomSheet.Content>
    </BottomSheet>
  );
}

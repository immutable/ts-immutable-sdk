import {
  Body,
  BottomSheet, Box, Button, FramedImage, Heading, Logo,
} from '@biom3/react';
import {
  containerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
  logoContainerStyles,
} from './NotEnoughImxStyles';
import { text } from '../../resources/text/textConfig';

type NotEnoughImxProps = {
  visible: boolean;
  showAdjustAmount: boolean;
  onCloseBottomSheet?: () => void;
  onAddCoinsClick: () => void;
};

export function NotEnoughImx({
  visible, showAdjustAmount, onCloseBottomSheet, onAddCoinsClick,
}: NotEnoughImxProps) {
  const { content, buttons } = text.drawers.notEnoughImx;

  const imxLogo = 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--imx.svg';

  return (
    <BottomSheet
      size="full"
      onCloseBottomSheet={onCloseBottomSheet}
      visible={visible}
      showHeaderBar={false}
    >
      <BottomSheet.Content>
        <Box testId="not-enough-gas-bottom-sheet" sx={containerStyles}>
          <FramedImage
            imageUrl={imxLogo}
            circularFrame
            sx={{
              height: '100px',
            }}
          />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="not-enough-gas-heading"
          >
            {content.heading}
          </Heading>
          <Body sx={contentTextStyles}>
            {content.body}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            {showAdjustAmount && (
            <Button
              testId="not-enough-gas-adjust-amount-button"
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseBottomSheet}
            >
              {buttons.adjustAmount}
            </Button>
            )}
            <Button
              testId="not-enough-gas-copy-address-button"
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onAddCoinsClick}
            >
              {buttons.addMoreImx}
            </Button>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseBottomSheet}
              testId="not-enough-gas-cancel-button"
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

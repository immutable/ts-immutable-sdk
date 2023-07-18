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
  actionButtonContainerNoImxStyles,
  actionButtonNoImxStyles,
} from './NotEnoughImxStyles';
import { text } from '../../resources/text/textConfig';

type NotEnoughImxProps = {
  visible: boolean;
  showAdjustAmount: boolean;
  displayOnlyDismissButton: boolean;
  onCloseBottomSheet?: () => void;
  onAddCoinsClick: () => void;
};

export function NotEnoughImx({
  visible, showAdjustAmount, displayOnlyDismissButton, onCloseBottomSheet, onAddCoinsClick,
}: NotEnoughImxProps) {
  const { content, buttons } = text.drawers.notEnoughImx;
  const { noImx, insufficientImx } = content;

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
            {displayOnlyDismissButton ? noImx.heading : insufficientImx.heading}
          </Heading>
          <Body sx={contentTextStyles}>
            {displayOnlyDismissButton ? noImx.body : insufficientImx.body}
          </Body>
          <Box sx={displayOnlyDismissButton ? actionButtonContainerNoImxStyles : actionButtonContainerStyles}>
            {(showAdjustAmount && !displayOnlyDismissButton) && (
              <Button
                testId="not-enough-gas-adjust-amount-button"
                sx={actionButtonStyles}
                variant="tertiary"
                onClick={onCloseBottomSheet}
              >
                {buttons.adjustAmount}
              </Button>
            )}
            {!displayOnlyDismissButton && (
              <Button
                testId="not-enough-gas-add-imx-button"
                sx={actionButtonStyles}
                variant="tertiary"
                onClick={onAddCoinsClick}
              >
                {buttons.addMoreImx}
              </Button>
            )}
            <Button
              sx={displayOnlyDismissButton ? actionButtonNoImxStyles : actionButtonStyles}
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

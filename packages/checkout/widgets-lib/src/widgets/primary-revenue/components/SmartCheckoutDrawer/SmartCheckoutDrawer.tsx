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
} from './SmartCheckoutDrawerStyles';

type SmartCheckoutDrawerProps = {
  visible: boolean;
  onCloseBottomSheet?: () => void;
};

export function SmartCheckoutDrawer({ visible, onCloseBottomSheet }: SmartCheckoutDrawerProps) {
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
            lorem ipsem
          </Heading>
          <Body sx={contentTextStyles}>
            lorem ipsem
          </Body>
          <Box sx={actionButtonContainerStyles}>
            lorem ipsem
            <Button
              testId="not-enough-gas-add-imx-button"
              sx={actionButtonStyles}
              variant="tertiary"
            >
              lorem ipsem
            </Button>
            <Button
              sx={actionButtonStyles}
              onClick={onCloseBottomSheet}
              variant="tertiary"
              testId="not-enough-gas-cancel-button"
            >
              close

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

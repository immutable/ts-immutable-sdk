import {
  Body,
  Drawer, Box, Button, FramedImage, Heading, Logo,
} from '@biom3/react';
import { useCallback, useState } from 'react';
import { ETH_TOKEN_SYMBOL } from 'lib';
import {
  containerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
  logoContainerStyles,
} from './NotEnoughGasStyles';
import { text } from '../../resources/text/textConfig';

type NotEnoughGasProps = {
  visible?: boolean;
  showHeaderBar?: boolean;
  walletAddress: string;
  showAdjustAmount: boolean;
  tokenSymbol: string;
  onCloseDrawer?: () => void;
  onAddCoinsClick?: () => void;
};

export function NotEnoughGas({
  onCloseDrawer,
  visible,
  showHeaderBar,
  walletAddress,
  showAdjustAmount,
  tokenSymbol,
  onAddCoinsClick,
}:
NotEnoughGasProps) {
  const { content, buttons } = text.drawers.notEnoughGas;

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (walletAddress && walletAddress !== '') {
      navigator.clipboard.writeText(walletAddress);
    }

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }, [walletAddress]);

  return (
    <Drawer
      headerBarTitle={undefined}
      size="full"
      onCloseDrawer={onCloseDrawer}
      visible={visible}
      showHeaderBar={showHeaderBar}
    >
      <Drawer.Content>
        <Box testId="not-enough-gas-bottom-sheet" sx={containerStyles}>
          <FramedImage
            imageUrl={
              tokenSymbol === 'ETH'
              // eslint-disable-next-line max-len
                ? 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg' : 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--imx.svg'
            }
            circularFrame
            sx={
              tokenSymbol === ETH_TOKEN_SYMBOL
                ? {
                  backgroundColor: 'white',
                  height: '100px',
                  width: '64px',
                  padding: '10px',
                }
                : {
                  height: '110px',
                  width: '64px',
                }
            }
          />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="not-enough-gas-heading"
          >
            {tokenSymbol === ETH_TOKEN_SYMBOL ? `${content.eth.heading}` : `${content.imx.heading}`}
          </Heading>
          <Body sx={contentTextStyles}>
            {tokenSymbol === ETH_TOKEN_SYMBOL ? `${content.eth.body}` : `${content.imx.body}`}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            {showAdjustAmount && (
              <Button
                testId="not-enough-gas-adjust-amount-button"
                sx={actionButtonStyles}
                variant="tertiary"
                onClick={onCloseDrawer}
              >
                {buttons.adjustAmount}
              </Button>
            )}
            {
              tokenSymbol === ETH_TOKEN_SYMBOL
                ? (
                  <Button
                    testId="not-enough-gas-copy-address-button"
                    sx={actionButtonStyles}
                    variant="tertiary"
                    onClick={handleCopy}
                  >
                    {buttons.copyAddress}
                    <Button.Icon icon={isCopied ? 'Tick' : 'CopyText'} />
                  </Button>
                )
                : (
                  <Button
                    testId="not-enough-gas-add-imx-button"
                    sx={actionButtonStyles}
                    variant="tertiary"
                    onClick={onAddCoinsClick}
                  >
                    {buttons.addMoreImx}
                  </Button>
                )
            }
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseDrawer}
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
      </Drawer.Content>
    </Drawer>
  );
}

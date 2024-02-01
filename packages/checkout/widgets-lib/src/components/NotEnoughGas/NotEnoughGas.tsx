import {
  Body,
  Drawer, Box, Button, Heading, Logo, CloudImage,
} from '@biom3/react';
import { useCallback, useState } from 'react';
import { CHECKOUT_CDN_BASE_URL, ETH_TOKEN_SYMBOL } from 'lib';
import { Environment } from '@imtbl/config';
import {
  containerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
  logoContainerStyles,
} from './NotEnoughGasStyles';
import { text } from '../../resources/text/textConfig';

type NotEnoughGasProps = {
  environment: Environment;
  visible?: boolean;
  showHeaderBar?: boolean;
  walletAddress: string;
  showAdjustAmount: boolean;
  tokenSymbol: string;
  onCloseDrawer?: () => void;
  onAddCoinsClick?: () => void;
};

export function NotEnoughGas({
  environment,
  onCloseDrawer,
  visible,
  showHeaderBar,
  walletAddress,
  showAdjustAmount,
  tokenSymbol,
  onAddCoinsClick,
}: NotEnoughGasProps) {
  const { content, buttons } = text.drawers.notEnoughGas;

  const [isCopied, setIsCopied] = useState(false);
  const ethLogo = `${CHECKOUT_CDN_BASE_URL[environment]}/v1/blob/img/tokens/eth.svg`;
  const imxLogo = `${CHECKOUT_CDN_BASE_URL[environment]}/v1/blob/img/tokens/imx.svg`;
  const heading = tokenSymbol === ETH_TOKEN_SYMBOL ? `${content.eth.heading}` : `${content.imx.heading}`;
  const body = tokenSymbol === ETH_TOKEN_SYMBOL ? `${content.eth.body}` : `${content.imx.body}`;

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
          <CloudImage
            imageUrl={
              tokenSymbol === 'ETH'
                ? ethLogo
                : imxLogo
            }
            sx={{ w: 'base.icon.size.600', h: 'base.icon.size.600' }}
          />

          <Heading
            size="small"
            sx={contentTextStyles}
            testId="not-enough-gas-heading"
          >
            {heading}
          </Heading>
          <Body sx={contentTextStyles}>
            {body}
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

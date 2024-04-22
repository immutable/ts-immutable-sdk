import {
  Body,
  Drawer, Box, Button, Heading, CloudImage,
} from '@biom3/react';
import { useCallback, useState } from 'react';
import { ETH_TOKEN_SYMBOL, IMAGE_RESIZER_URL } from 'lib';
import { Environment } from '@imtbl/config';
import { getRemoteImage } from 'lib/utils';
import { useTranslation } from 'react-i18next';
import {
  containerStyles,
  headingTextStyles,
  bodyTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
} from './NotEnoughGasStyles';

type NotEnoughGasProps = {
  environment: Environment;
  visible?: boolean;
  walletAddress: string;
  tokenSymbol: string;
  onCloseDrawer?: () => void;
  onAddCoinsClick?: () => void;
};

export function NotEnoughGas({
  environment,
  onCloseDrawer,
  visible,
  walletAddress,
  tokenSymbol,
  onAddCoinsClick,
}:
NotEnoughGasProps) {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const notEnoughEth = getRemoteImage(environment, '/notenougheth.svg');
  const notEnoughImx = getRemoteImage(environment, '/notenoughimx.svg');

  const heading = t('drawers.notEnoughGas.content.heading', {
    token: tokenSymbol.toUpperCase(),
  });
  const body = t('drawers.notEnoughGas.content.body', {
    token: tokenSymbol.toUpperCase(),
  });
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
      size="threeQuarter"
      visible={visible}
      showHeaderBar
      headerBarTitle={undefined}
      onCloseDrawer={onCloseDrawer}
    >
      <Drawer.Content testId="not-enough-gas-bottom-sheet" sx={containerStyles}>
        <CloudImage
          imageUrl={
              tokenSymbol === ETH_TOKEN_SYMBOL
                ? notEnoughEth
                : notEnoughImx
            }
          imageResizeServiceUrl={IMAGE_RESIZER_URL[environment]}
          sx={{ w: '90px', h: tokenSymbol === ETH_TOKEN_SYMBOL ? '110px' : '90px' }}
        />
        <Heading
          size="small"
          weight="bold"
          sx={headingTextStyles}
          testId="not-enough-gas-heading"
        >
          {heading}
        </Heading>
        <Body sx={bodyTextStyles}>
          {body}
        </Body>
        <Box sx={actionButtonContainerStyles}>
          {tokenSymbol === ETH_TOKEN_SYMBOL
            ? (
              <Button
                testId="not-enough-gas-copy-address-button"
                sx={actionButtonStyles}
                variant="primary"
                onClick={handleCopy}
              >
                {t('drawers.notEnoughGas.buttons.copyAddress')}
                <Button.Icon icon={isCopied ? 'Tick' : 'CopyText'} />
              </Button>
            )
            : (
              <Button
                testId="not-enough-gas-add-imx-button"
                sx={actionButtonStyles}
                variant="primary"
                onClick={onAddCoinsClick}
              >
                {t('drawers.notEnoughGas.buttons.addMoreImx')}
              </Button>
            )}
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

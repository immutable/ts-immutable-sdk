import {
  AspectRatioImage,
  Body,
  Box,
  ButtCon,
  Button,
  Drawer,
  Heading,
} from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { getL1ChainId } from 'lib';
import { getChainNameById } from 'lib/chains';
import {
  isMetaMaskProvider,
  isWalletConnectProvider,
} from 'lib/provider';
import { getRemoteImage } from 'lib/utils';
import {
  useCallback, useMemo, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

export interface NetworkSwitchDrawerProps {
  visible: boolean;
  targetChainId: ChainId;
  provider: Web3Provider;
  checkout: Checkout;
  onCloseDrawer: () => void;
  onNetworkSwitch?: (provider: Web3Provider) => void;
}
export function NetworkSwitchDrawer({
  visible,
  targetChainId,
  provider,
  checkout,
  onCloseDrawer,
  onNetworkSwitch,
}: NetworkSwitchDrawerProps) {
  const { t } = useTranslation();

  const ethImageUrl = getRemoteImage(
    checkout.config.environment ?? Environment.PRODUCTION,
    '/switchnetworkethereum.png',
  );

  const zkevmImageUrl = getRemoteImage(
    checkout.config.environment ?? Environment.PRODUCTION,
    '/switchnetworkzkevm.png',
  );

  const targetChainName = getChainNameById(targetChainId);
  const showEthImage = targetChainId === getL1ChainId(checkout.config);

  const handleSwitchNetwork = useCallback(async () => {
    if (!checkout) return;
    const switchNetworkResult = await checkout.switchNetwork({
      provider,
      chainId: targetChainId,
    });
    if (onNetworkSwitch) {
      onNetworkSwitch(switchNetworkResult.provider);
    }
  }, [checkout, provider, onNetworkSwitch, targetChainId]);

  const isWalletConnect = isWalletConnectProvider(provider);

  const walletConnectPeerName = useMemo(() => {
    if (!isWalletConnect) return '';
    return (provider.provider as any)?.session?.peer?.metadata?.name as string;
  }, [provider, isWalletConnect]);

  const isMetaMaskMobileWalletPeer = useMemo(
    () => walletConnectPeerName?.toLowerCase().includes('metamask'),
    [walletConnectPeerName],
  );

  const walletDisplayName = useMemo(() => {
    if (isMetaMaskProvider(provider)) return 'MetaMask wallet';
    if (isWalletConnect && walletConnectPeerName) return walletConnectPeerName;
    return 'wallet';
  }, [provider, isWalletConnect, walletConnectPeerName]);

  const requireManualSwitch = isWalletConnect && isMetaMaskMobileWalletPeer;

  // Image preloading - load images into browser when component mounts
  // show cached images when drawer is made visible
  useEffect(() => {
    const switchNetworkEthImage = new Image();
    switchNetworkEthImage.src = ethImageUrl;
    const switchNetworkzkEVMImage = new Image();
    switchNetworkzkEVMImage.src = zkevmImageUrl;
  }, []);

  return (
    <Drawer
      size="threeQuarter"
      visible={visible}
      onCloseDrawer={onCloseDrawer}
      showHeaderBar={false}
    >
      <Drawer.Content sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <AspectRatioImage
          aspectRatio="21:9"
          responsiveSizes={[450, 512, 640, 720, 860, 1024, 1280, 1440]}
          imageUrl={showEthImage ? ethImageUrl : zkevmImageUrl}
        />
        <ButtCon
          icon="Close"
          variant="tertiary"
          sx={{
            pos: 'absolute',
            top: 'base.spacing.x5',
            left: 'base.spacing.x5',
            backdropFilter: 'blur(30px)',
          }}
          onClick={onCloseDrawer}
        />
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'base.spacing.x4',
          paddingX: 'base.spacing.x6',
        }}
        >
          <Heading size="small" weight="bold" sx={{ textAlign: 'center', paddingX: 'base.spacing.x6' }}>
            {t('drawers.networkSwitch.heading', {
              wallet: walletDisplayName,
            })}
          </Heading>
          {/** MetaMask mobile requires manual switch */}
          {requireManualSwitch && (
          <Body
            size="medium"
            weight="regular"
            sx={{
              color: 'base.color.text.body.secondary',
              textAlign: 'center',
              paddingX: 'base.spacing.x6',
            }}
          >
            {t('drawers.networkSwitch.manualSwitch.body', {
              chain: targetChainName,
            })}
          </Body>
          )}
          {!requireManualSwitch && (
          <Body
            size="medium"
            weight="regular"
            sx={{
              color: 'base.color.text.body.secondary',
              textAlign: 'center',
              paddingX: 'base.spacing.x6',
            }}
          >
            {t('drawers.networkSwitch.controlledSwitch.body', {
              chain: targetChainName,
            })}
          </Body>
          )}
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x4',
          width: '100%',
        }}
        >
          {!requireManualSwitch && (
          <Button
            size="large"
            variant="primary"
            sx={{ width: '100%', marginBottom: 'base.spacing.x2' }}
            onClick={handleSwitchNetwork}
          >
            {t('drawers.networkSwitch.switchButton', {
              chain: targetChainName,
            })}
          </Button>
          )}
          <FooterLogo />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

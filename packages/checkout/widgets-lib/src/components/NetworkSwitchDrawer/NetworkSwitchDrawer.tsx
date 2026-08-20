import {
  Body,
  Box,
  ButtCon,
  Button,
  CloudImage,
  Drawer,
  Heading,
} from '@biom3/react';
import {
  useCallback, useMemo, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ChainId, Checkout, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { FooterLogo } from '../Footer/FooterLogo';
import { getChainNameById } from '../../lib/chains';
import {
  isMetaMaskProvider,
  isPassportProvider,
  isWalletConnectProvider,
} from '../../lib/provider';
import { getRemoteImage } from '../../lib/utils';

export interface NetworkSwitchDrawerProps {
  visible: boolean;
  targetChainId: ChainId;
  provider: WrappedBrowserProvider;
  checkout: Checkout;
  onCloseDrawer: () => void;
  onNetworkSwitch?: (provider: WrappedBrowserProvider) => void;
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
  const [switchFailed, setSwitchFailed] = useState(false);

  const ethImageUrl = getRemoteImage(
    checkout.config.environment ?? Environment.PRODUCTION,
    '/switchnetworkethereum.svg',
  );

  const zkevmImageUrl = getRemoteImage(
    checkout.config.environment ?? Environment.PRODUCTION,
    '/switchnetworkzkevm.svg',
  );

  const targetChainName = getChainNameById(targetChainId);
  const showEthImage = targetChainId === checkout.config.l1ChainId;

  const handleSwitchNetwork = useCallback(async () => {
    if (!checkout) return;
    try {
      const switchNetworkResult = await checkout.switchNetwork({
        provider,
        chainId: targetChainId,
      });
      if (onNetworkSwitch) {
        onNetworkSwitch(switchNetworkResult.provider);
      }
    } catch (err) {
      // Without this catch the rejection is unhandled: the click handler returns
      // a floating promise, so a failed switch surfaces only as a console error
      // and floods error reporting instead of telling the user anything.
      // eslint-disable-next-line no-console
      console.error(err);
      setSwitchFailed(true);
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
    if (isPassportProvider(provider)) return 'Passport wallet';
    if (isMetaMaskProvider(provider)) return 'MetaMask wallet';
    if (isWalletConnect && walletConnectPeerName) return walletConnectPeerName;
    return 'wallet';
  }, [provider, isWalletConnect, walletConnectPeerName]);

  // Passport rejects wallet_switchEthereumChain by design (see `switchWalletNetwork`
  // in checkout-sdk), so offering a switch button leads the user to a dead end.
  const cannotSwitch = isPassportProvider(provider);

  const requireManualSwitch = isWalletConnect && isMetaMaskMobileWalletPeer;

  const bodyTextKey = useMemo(() => {
    if (cannotSwitch) return 'drawers.networkSwitch.unsupportedSwitch.body';
    if (switchFailed) return 'drawers.networkSwitch.switchFailed.body';
    if (requireManualSwitch) return 'drawers.networkSwitch.manualSwitch.body';
    return 'drawers.networkSwitch.controlledSwitch.body';
  }, [cannotSwitch, switchFailed, requireManualSwitch]);

  // Clear a previous failure when the drawer is reopened or the target changes,
  // so a stale error message doesn't carry into a fresh attempt.
  useEffect(() => {
    if (visible) setSwitchFailed(false);
  }, [visible, provider, targetChainId]);

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
        <CloudImage
          use={(
            <img
              src={showEthImage ? ethImageUrl : zkevmImageUrl}
              alt={t('drawers.networkSwitch.heading', {
                wallet: walletDisplayName,
              })}
            />
          )}
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
          {/**
            * Copy depends on whether the wallet can switch at all (Passport cannot),
            * whether a previous attempt failed, and whether the wallet requires a
            * manual switch (MetaMask mobile over WalletConnect).
            */}
          <Body
            size="medium"
            weight="regular"
            sx={{
              color: 'base.color.text.body.secondary',
              textAlign: 'center',
              paddingX: 'base.spacing.x6',
            }}
          >
            {t(bodyTextKey, {
              chain: targetChainName,
              wallet: walletDisplayName,
            })}
          </Body>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x4',
          width: '100%',
        }}
        >
          {!requireManualSwitch && !cannotSwitch && (
          <Button
            size="large"
            variant="primary"
            sx={{ width: '100%', marginBottom: 'base.spacing.x2' }}
            onClick={handleSwitchNetwork}
          >
            {t(
              switchFailed
                ? 'drawers.networkSwitch.retryButton'
                : 'drawers.networkSwitch.switchButton',
              { chain: targetChainName },
            )}
          </Button>
          )}
          <FooterLogo />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

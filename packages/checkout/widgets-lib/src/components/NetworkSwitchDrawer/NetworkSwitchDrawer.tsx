import {
  Body, Box, Button, CloudImage, Drawer, Heading, Logo,
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
} from 'lib/providerUtils';
import { getRemoteImage } from 'lib/utils';
import { useCallback, useMemo } from 'react';
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

  const targetChainName = getChainNameById(targetChainId);
  const networkSwitchImage = useMemo(() => {
    if (targetChainId === getL1ChainId(checkout.config)) {
      const ethNetworkImageUrl = getRemoteImage(Environment.SANDBOX, '/switchnetworkethereum.svg');
      return <CloudImage imageUrl={ethNetworkImageUrl} sx={{ width: '161px', height: '98px' }} />;
    }
    return <Logo logo="ImmutableSymbol" sx={{ fill: 'base.color.accent.1', width: 'base.spacing.x20' }} />;
  }, [targetChainId]);

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

  return (
    <Drawer
      size="threeQuarter"
      visible={visible}
      onCloseDrawer={onCloseDrawer}
      showHeaderBar
      headerBarTitle=""
    >
      <Drawer.Content sx={{
        paddingX: 'base.spacing.x4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'base.spacing.x4',
          paddingX: 'base.spacing.x2',
        }}
        >
          {networkSwitchImage}
          <Heading size="small" weight="bold" sx={{ textAlign: 'center', paddingX: 'base.spacing.x6' }}>
            {`${t('drawers.networkSwitch.heading')} ${walletDisplayName}`}
          </Heading>
          {/** MetaMask mobile requires manual switch */}
          {requireManualSwitch && (
            <Body size="large" weight="regular" sx={{ textAlign: 'center' }}>
              {
              // eslint-disable-next-line max-len
              `${t('drawers.networkSwitch.manualSwitch.body1')}${targetChainName}${t('drawers.networkSwitch.manualSwitch.body2')}`
              }
            </Body>
          )}
          {!requireManualSwitch && (
            <Body size="large" weight="regular" sx={{ textAlign: 'center' }}>
              {
              // eslint-disable-next-line max-len
              `${t('drawers.networkSwitch.controlledSwitch.body1')}${targetChainName}${t('drawers.networkSwitch.controlledSwitch.body2')}`
              }
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
              {`${t('drawers.networkSwitch.switchButton')}${targetChainName}`}
            </Button>
          )}
          <FooterLogo />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

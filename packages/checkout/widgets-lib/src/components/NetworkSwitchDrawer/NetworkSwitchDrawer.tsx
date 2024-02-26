import {
  Body, Box, Button, Drawer, Logo,
} from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { getChainNameById } from 'lib/chains';
import { getWalletLogoByName } from 'lib/logoUtils';
import { getWalletProviderNameByProvider, isWalletConnectProvider } from 'lib/providerUtils';
import { useCallback, useMemo } from 'react';

export interface NetworkSwitchDrawerProps {
  visible: boolean;
  targetChainId: ChainId;
  provider: Web3Provider;
  checkout: Checkout;
  onCloseDrawer: () => void;
  onNetworkSwitch: (provider: Web3Provider) => void;
}
export function NetworkSwitchDrawer({
  visible,
  targetChainId,
  provider,
  checkout,
  onCloseDrawer,
  onNetworkSwitch,
}: NetworkSwitchDrawerProps) {
  const targetChainName = getChainNameById(targetChainId);

  const handleSwitchNetwork = useCallback(async () => {
    if (!checkout) return;
    const switchNetworkResult = await checkout.switchNetwork({
      provider,
      chainId: targetChainId,
    });
    onNetworkSwitch(switchNetworkResult.provider);
  }, [checkout, provider, onNetworkSwitch, targetChainId]);

  const walletLogo = getWalletLogoByName(getWalletProviderNameByProvider(provider));

  const isWalletConnect = isWalletConnectProvider(provider);

  const walletConnectPeerName = useMemo(() => {
    if (!isWalletConnect) return '';
    return (provider.provider as any)?.session?.peer?.metadata?.name as string;
  }, [provider, isWalletConnect]);

  const isMetaMaskMobileWalletPeer = useMemo(
    () => walletConnectPeerName?.toLowerCase().includes('metamask'),
    [walletConnectPeerName],
  );

  const openWalletUrl = useCallback(() => {
    if (!isWalletConnect) return;
    const redirectUrl = (provider.provider as any)?.session?.peer?.metadata?.redirect?.native;
    window.open(redirectUrl, '_self');
  }, [provider, isWalletConnect]);

  return (
    <Drawer
      size="full"
      visible={visible}
      onCloseDrawer={onCloseDrawer}
      showHeaderBar
      headerBarTitle="Switch Network"
    >
      <Drawer.Content sx={{
        padding: 'base.spacing.x4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'base.spacing.x4',
        flex: 1,
      }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'base.spacing.x4',
        }}
        >
          <Logo logo={walletLogo} sx={{ width: 'base.icon.size.600' }} />
          {isWalletConnect && <Body>{walletConnectPeerName}</Body>}
          <Body sx={{ paddingX: 'base.spacing.x6' }}>
            You will need to switch to
            {targetChainName}
            {' '}
            to proceed.
          </Body>
          {isWalletConnect && isMetaMaskMobileWalletPeer && (
            <>
              <Body sx={{ marginTop: 'base.spacing.x6' }}>
                You need to go to your mobile wallet (
                {walletConnectPeerName}
                ) and switch the network to
                {targetChainName}
                {' '}
                in order to proceed.
              </Body>
              <Button onClick={openWalletUrl}>Open MetaMask</Button>
            </>
          )}
        </Box>

        {(!isWalletConnect || (isWalletConnect && !isMetaMaskMobileWalletPeer)) && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingY: 'base.spacing.x6',
            paddingX: 'base.spacing.x4',
            width: '100%',
          }}
          >
            <Button size="large" variant="tertiary" sx={{ width: '100%' }} onClick={handleSwitchNetwork}>
              Switch to
              {targetChainName}
            </Button>
          </Box>
        )}
      </Drawer.Content>
    </Drawer>
  );
}

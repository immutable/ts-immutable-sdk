import { Body, Button, Drawer, Heading, Logo } from "@biom3/react"
import { Web3Provider } from "@ethersproject/providers";
import { ChainId, Checkout } from "@imtbl/checkout-sdk";
import { providers } from "ethers";
import { getChainNameById } from "lib/chains";
import { getWalletLogoByName } from "lib/logoUtils";
import { getWalletProviderNameByProvider, isMetaMaskProvider, isWalletConnectProvider } from "lib/providerUtils";
import { useCallback, useMemo } from "react";

export interface NetworkSwitchDrawerProps {
  visible: boolean;
  targetChainId: ChainId;
  provider: Web3Provider;
  checkout: Checkout;
  onCloseDrawer: () => void;
  onNetworkSwitch: (provider: Web3Provider) => void;
}
export const NetworkSwitchDrawer = ({
  visible,
  targetChainId,
  provider,
  checkout,
  onCloseDrawer,
  onNetworkSwitch
}) => {
  const targetChainName = getChainNameById(targetChainId);

  const handleSwitchNetwork = useCallback(async() => {
    if(!checkout) return;
    const switchNetworkResult = await checkout.switchNetwork({
      provider,
      chainId: targetChainId
    })
    onNetworkSwitch(switchNetworkResult.provider)
  }, [checkout, provider, onNetworkSwitch, targetChainId])

  const walletLogo = getWalletLogoByName(getWalletProviderNameByProvider(provider));

  const isWalletConnect = isWalletConnectProvider(provider);

  const walletConnectPeer = useMemo(() => {
    if(!isWalletConnect) return '';
    return (provider.provider as any)?.session?.peer?.metadata?.name as string;
  }, [provider, isWalletConnect])

  return(
    <Drawer 
    size="full" 
    visible={visible}
     onCloseDrawer={onCloseDrawer}
     showHeaderBar
     headerBarTitle="Switch Network">
      <Drawer.Content sx={{
        padding: 'base.spacing.x4',
        display: 'flex',
        flexDirection: 'column',
        gap: 'base.spacing.x2'
      }}>
        <Logo logo={walletLogo} sx={{ width: 'base.icon.size.600' }} />
        {isWalletConnect && <Body>{walletConnectPeer}</Body>}
        <Heading size="large">Switch to {targetChainName} to proceed</Heading>
        {isWalletConnect && <Body>Go to your mobile wallet and ensure you are connected to {targetChainName}</Body>}
        {!walletConnectPeer?.toLowerCase().includes('metamask') && (
          <Button onClick={handleSwitchNetwork}>Switch to {targetChainName}</Button>
        )}
        {isMetaMaskProvider(provider) && (
          <Button onClick={handleSwitchNetwork}>Switch to {targetChainName}</Button>
        )}
      </Drawer.Content>
    </Drawer>
  )
}
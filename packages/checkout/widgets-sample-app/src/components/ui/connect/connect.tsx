import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChainId, ChainName, ChainSlug, Checkout, CheckoutModuleConfiguration, ConnectEventType, WalletProviderRdns, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

const ZKEVM_NATIVE_TOKEN = {
  name: "IMX",
  symbol: "IMX",
  decimals: 18,
  address: "native",
};

const DEV_CHAIN_ID_NETWORK_MAP = new Map([
  [
    ChainId.SEPOLIA,
    {
      chainIdHex: `0x${ChainId.SEPOLIA.toString(16)}`,
      chainName: ChainName.SEPOLIA,
      rpcUrls: ["https://checkout-api.dev.immutable.com/v1/rpc/eth-sepolia"],
      nativeCurrency: {
        name: "Sep Eth",
        symbol: "ETH",
        decimals: 18,
      },
      blockExplorerUrls: ["https://sepolia.etherscan.io/"],
    },
  ],
  [
    ChainId.IMTBL_ZKEVM_DEVNET,
    {
      chainIdHex: `0x${ChainId.IMTBL_ZKEVM_DEVNET.toString(16)}`,
      chainName: ChainName.IMTBL_ZKEVM_DEVNET,
      rpcUrls: ["https://rpc.dev.immutable.com"],
      nativeCurrency: ZKEVM_NATIVE_TOKEN,
    },
  ],
]);

const overrides: CheckoutModuleConfiguration["overrides"] = {
    baseUrl: "https://api.dev.immutable.com",
    chainSlug: ChainSlug.IMTBL_ZKEVM_DEVNET,
    l2ChainId: ChainId.IMTBL_ZKEVM_DEVNET,
    networkMap: DEV_CHAIN_ID_NETWORK_MAP,
    remoteConfigEndpoint: "https://checkout-api.dev.immutable.com",
  };

const CONNECT_TARGET_ID = "connect-widget-target";
function ConnectUI() {
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: Environment.SANDBOX }, overrides }), []);
  const [factory, setFactory] = useState<ImmutableCheckoutWidgets.WidgetsFactory>();
  const connect = useMemo(() => {
    if(!factory) return;
    return (factory).create(WidgetType.CONNECT)
  }, [factory]);
  const [provider, setProvider] = useState();

  useEffect(() => {
    (async () => {
      setFactory(new WidgetsFactory(checkout, {
        theme: WidgetTheme.DARK,
        walletConnect: {
          projectId: '938b553484e344b1e0b4bb80edf8c362',
          metadata: {
            name: 'Checkout Marketplace',
            description: 'Checkout Marketplace',
            url: 'http://localhost:3000/marketplace-orchestrator',
            icons: []
          }
        }
      }));
    })()
  }, [checkout]);

  useEffect(() => {
    if(!connect) return;
    connect.mount(CONNECT_TARGET_ID, {})
    connect.addListener(ConnectEventType.SUCCESS, (data: any) => {
      setProvider(data.provider);
    })
    connect.addListener(ConnectEventType.CLOSE_WIDGET, (data: any) => {
      connect.unmount();
    })
  }, [connect]);

  const connectWC = useCallback(async () => {
    if(!connect && !provider) return;
    connect!.mount(CONNECT_TARGET_ID, {
      targetWalletRdns: WalletProviderRdns.WALLETCONNECT,
    });
  }, [connect, provider, checkout]);

  const connectMetaMask = useCallback(async () => {
    if(!connect && !provider) return;
    connect!.mount(CONNECT_TARGET_ID, {
      targetWalletRdns: WalletProviderRdns.METAMASK,
    });
  }, [connect, provider, checkout]);

  const connectPassport = useCallback(async () => {
    if(!connect && !provider) return;
    connect!.mount(CONNECT_TARGET_ID, {
      targetWalletRdns: WalletProviderRdns.PASSPORT,
    });
  }, [connect, provider, checkout]);

  const connectCoinbase = useCallback(async () => {
    if(!connect && !provider) return;
    connect!.mount(CONNECT_TARGET_ID, {
      targetWalletRdns: 'com.coinbase.wallet'
    });
  }, [connect, provider, checkout]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Connect</h1>
      <div id={CONNECT_TARGET_ID}></div>
      <button onClick={() => connect?.mount(CONNECT_TARGET_ID)}>Mount</button>
      <button onClick={() => connect?.unmount()}>Unmount</button>
      <button onClick={() => connect?.update({ config: { language: 'en'}})}>EN</button>
      <button onClick={() => connect?.update({ config: { language: 'ja'}})}>JA</button>
      <button onClick={() => connect?.update({ config: { language: 'ko'}})}>KO</button>
      <button onClick={() => connect?.update({ config: { language: 'zh'}})}>ZH</button>
      <button onClick={() => connectMetaMask()}>Connect MetaMask</button>
      <button onClick={() => connectWC()}>Connect WC</button>
      <button onClick={() => connectPassport()}>Connect Passport</button>
      <button onClick={() => connectCoinbase()}>Connect Coinbase</button>
    </div>
  );
}

export default ConnectUI;

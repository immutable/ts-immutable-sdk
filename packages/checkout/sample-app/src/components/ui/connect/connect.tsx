import { useCallback, useEffect, useMemo, useState } from 'react';

import { Checkout, ConnectEventType, WalletProviderRdns, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

const CONNECT_TARGET_ID = "connect-widget-target";
function ConnectUI() {
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: Environment.SANDBOX } }), []);
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

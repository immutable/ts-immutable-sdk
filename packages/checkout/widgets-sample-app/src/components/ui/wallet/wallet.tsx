import { useEffect, useMemo, useState } from 'react';
import { Checkout, WalletEventType, WalletProviderName, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { Web3Provider } from "@ethersproject/providers";

function WalletUI() {
  const checkout = useMemo(() => new Checkout(), [])
  const [wallet, setWallet] = useState<any>();
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(undefined);

  useEffect(() => {
    const walletProviderName = WalletProviderName.PASSPORT;
    checkout.createProvider({ walletProviderName }).then((resp) => setWeb3Provider(resp.provider));
  }, []);

  const unmount = () => {wallet.unmount()}
  const mount = () => {wallet.mount('wallet')}
  const update = (theme: WidgetTheme) => {wallet.update({config: {theme}})}
  const updateLanguage = (language: any) => {wallet.update({config: {language}})}

  useEffect(() => {
    if (!wallet && checkout && web3Provider) {
      const walletWidget = new WidgetsFactory(checkout, {}).create(WidgetType.WALLET, {
          provider: web3Provider,
          config: { theme: WidgetTheme.DARK  },
      })
      setWallet(walletWidget);
      walletWidget.addListener(WalletEventType.NETWORK_SWITCH, (data) => {console.log('NETWORK_SWITCH', data)})
      walletWidget.addListener(WalletEventType.CLOSE_WIDGET, () => {{
        window.location.href = "imxsample://addfunds?status=hell_from_widget";
        walletWidget.unmount()
      }})
      walletWidget.mount('wallet');
    }

  }, [checkout, web3Provider]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Wallet</h1>
      <div id="wallet"></div>
      <button onClick={unmount}>Unmount</button>
      <button onClick={mount}>Mount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
      <button onClick={() => updateLanguage('en')}>EN</button>
      <button onClick={() => updateLanguage('ja')}>JA</button>
      <button onClick={() => updateLanguage('ko')}>KO</button>
      <button onClick={() => updateLanguage('zh')}>ZH</button>
    </div>
  );
}

export default WalletUI;

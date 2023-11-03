import { useEffect, useMemo } from 'react';
import { Checkout, WalletEventType, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

function WalletUI() {
  const checkout = useMemo(() => new Checkout(), [])
  const wallet = useMemo(() => new WidgetsFactory(checkout, {}).create(WidgetType.WALLET, {}), [checkout])  

  const unmount = () => {wallet.unmount()}
  const mount = () => {wallet.mount('wallet')}
  const update = (theme: WidgetTheme) => {wallet.update({config: {theme}})}
  const destroy = () => {wallet.destroy()}
  
  useEffect(() => {
    mount()
    wallet.addListener(WalletEventType.NETWORK_SWITCH, (data) => {console.log('NETWORK_SWITCH', data)})
    wallet.addListener(WalletEventType.CLOSE_WIDGET, () => {destroy()})
  }, []);

  return (
    <div>
      <h1 className="sample-heading">Checkout Wallet</h1>
      <div id="wallet"></div>
      <button onClick={unmount}>Unmount</button>
      <button onClick={mount}>Mount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
      <button onClick={destroy}>Destroy</button>
    </div>
  );
}

export default WalletUI;

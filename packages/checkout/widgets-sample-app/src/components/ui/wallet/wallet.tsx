import { useEffect, useMemo } from 'react';
import { Checkout, WalletEventType, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { Web3Provider } from '@ethersproject/providers';
import { IFrameEthereumProvider } from '@ledgerhq/iframe-provider';

/**
 * Debug messages from the iframe
 */
window.addEventListener('message', async (event) => {
  if (!event.data?.target) {
    console.log('IFRAME::messageHandler::', event);
  }
});

function WalletUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const isIFrame = window.self !== window.top;
  const wallet = useMemo(() => {
    const provider = (isIFrame) ? new Web3Provider(new IFrameEthereumProvider() as any) as any : null;
    return new WidgetsFactory(checkout, {}).create(WidgetType.WALLET, { provider });
  }, [checkout])

  const unmount = () => {wallet.unmount()}
  const mount = () => {wallet.mount('wallet')}
  const update = (theme: WidgetTheme) => {wallet.update({config: {theme}})}

  useEffect(() => {
    mount()
    wallet.addListener(WalletEventType.NETWORK_SWITCH, (data) => {console.log('NETWORK_SWITCH', data)})
    wallet.addListener(WalletEventType.CLOSE_WIDGET, () => {unmount()})
  }, []);

  return (
    <div>
      <h1 className="sample-heading">Checkout Wallet {isIFrame ? '- IFrame Detected' : ''}</h1>
      <div id="wallet"></div>
      <button onClick={unmount}>Unmount</button>
      <button onClick={mount}>Mount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
    </div>
  );
}

export default WalletUI;

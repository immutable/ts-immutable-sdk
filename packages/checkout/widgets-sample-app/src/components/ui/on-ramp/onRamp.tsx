import { Checkout, OnRampEventType, WalletProviderName, WidgetTheme, WidgetType } from "@imtbl/checkout-sdk";
import { useEffect, useMemo } from "react";
import { WidgetsFactory } from "@imtbl/checkout-widgets";

function OnRampUI() {
  const checkout = useMemo(() => new Checkout(), [])
  const onRamp = useMemo(() => new WidgetsFactory(checkout, {}).create(WidgetType.ONRAMP), [checkout])

  const unmount = () => {onRamp.unmount()}
  const mount = () => {
    onRamp.mount('onramp', {
      amount: '55',
      tokenAddress: '0x0000000000000000000000000000000000001010',
      walletProviderName: WalletProviderName.PASSPORT
    })
  }
  const update = (theme: WidgetTheme) => {onRamp.update({config: {theme}})}

  useEffect(() => {
    mount()
    onRamp.addListener(OnRampEventType.SUCCESS, (data) => {
      console.log('SUCCESS', data)
    })
    onRamp.addListener(OnRampEventType.FAILURE, (data) => {
      console.log('FAILURE', data)
    })
    onRamp.addListener(OnRampEventType.CLOSE_WIDGET, () => {
      unmount()
    })
  }, []);

  return (
    <div>
    <h1 className="sample-heading">Checkout OnRamp</h1>
    <div id="onramp"></div>
    <button onClick={unmount}>Unmount</button>
    <button onClick={mount}>Mount</button>
    <button onClick={() => update(WidgetTheme.LIGHT)}>Update Config Light</button>
    <button onClick={() => update(WidgetTheme.DARK)}>Update Config Dark</button>
  </div>
  );
}

export default OnRampUI;

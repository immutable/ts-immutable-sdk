import { Checkout, ConnectEventType, ConnectionSuccess, OnRampEventType, WalletEventType, WidgetTheme, WidgetType } from "@imtbl/checkout-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WidgetsFactory } from "@imtbl/checkout-widgets";

function OnRampUI() {
  const checkout = useMemo(() => new Checkout(), [])
  const onRamp = useMemo(() => new WidgetsFactory(checkout, {}).create(WidgetType.ONRAMP, {}), [checkout])

  const unmount = () => {onRamp.unmount()}
  const mount = () => {
    onRamp.mount('onramp')}
  const update = (theme: WidgetTheme) => {onRamp.update({config: {theme}})}
  const updateParams = () => onRamp.update({params: {amount: '55', contractAddress: '0x0000000000000000000000000000000000001010'}})
  const destroy = () => {onRamp.destroy()}

  useEffect(() => {
    mount()
    onRamp.addListener(OnRampEventType.SUCCESS, (data) => {
      console.log('SUCCESS', data)
    })
    onRamp.addListener(OnRampEventType.FAILURE, (data) => {
      console.log('FAILURE', data)
    })
    onRamp.addListener(OnRampEventType.CLOSE_WIDGET, () => {
      destroy()
    })
  }, []);

  return (
    <div>
    <h1 className="sample-heading">Checkout OnRamp</h1>
    <div id="onramp"></div>
    <button onClick={unmount}>Unmount</button>
    <button onClick={mount}>Mount</button>
    <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
    <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
      <button onClick={() => updateParams()}>Update params</button>
    <button onClick={destroy}>Destroy</button>
  </div>
  );
}

export default OnRampUI;

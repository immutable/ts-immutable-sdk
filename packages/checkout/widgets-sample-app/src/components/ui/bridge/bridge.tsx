import { BridgeEventType, Checkout, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets'
import { useEffect, useMemo } from 'react';

const BRIDGE_TARGET_ID = 'bridge-widget-target';
function BridgeUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);
  const bridge = useMemo(() => factory.create(WidgetType.BRIDGE, {}),[factory]);
  
  useEffect(() => {
    bridge.mount(BRIDGE_TARGET_ID);
    bridge.addListener(BridgeEventType.SUCCESS, (data: any) => {
      console.log('SUCCESS', data);
    });
    bridge.addListener(BridgeEventType.FAILURE, (data: any) => {
      console.log('FAILURE', data);
    });
    bridge.addListener(BridgeEventType.CLOSE_WIDGET, (data: any) => {
      console.log('CLOSE_WIDGET', data);
      bridge.destroy();
    });
  }, [bridge])
  
  return (
    <div>
      <h1 className="sample-heading">Checkout Bridge</h1>
      <div id={BRIDGE_TARGET_ID}></div>
      <button onClick={() => bridge.mount(BRIDGE_TARGET_ID)}>Mount</button>
      <button onClick={() => bridge.unmount()}>Unmount</button>
      <button onClick={() => bridge.update({ config: { theme: WidgetTheme.LIGHT } })}>Light Theme</button>
      <button onClick={() => bridge.update({ config: { theme: WidgetTheme.DARK } })}>Dark Theme</button>
      <button onClick={() => bridge.update({
        params: { amount: '10', fromContractAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a' }
      })}>Update Params</button>
      <button onClick={() => bridge.destroy()}>Destroy</button>
    </div>
  );
}

export default BridgeUI;

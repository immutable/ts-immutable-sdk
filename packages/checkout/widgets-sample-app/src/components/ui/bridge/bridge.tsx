import { BridgeEventType, Checkout, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets'
import { useEffect, useMemo } from 'react';

const BRIDGE_TARGET_ID = 'bridge-widget-target';
function BridgeUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }), [checkout]);
  const bridge = useMemo(() => factory.create(WidgetType.BRIDGE), [factory]);

  useEffect(() => {
    bridge.mount(BRIDGE_TARGET_ID, { amount: '0.1', tokenAddress: 'NATIVE' });
    bridge.addListener(BridgeEventType.TRANSACTION_SENT, (data: any) => {
      console.log('SUCCESS', data);
    });
    bridge.addListener(BridgeEventType.FAILURE, (data: any) => {
      console.log('FAILURE', data);
    });
    bridge.addListener(BridgeEventType.CLOSE_WIDGET, (data: any) => {
      console.log('CLOSE_WIDGET', data);
      bridge.unmount();
    });
  }, [bridge])

  return (
    <div>
      <h1 className="sample-heading">Checkout Bridge</h1>
      <div id={BRIDGE_TARGET_ID}></div>
      <button onClick={() => bridge.mount(BRIDGE_TARGET_ID, { amount: '10' })}>Mount</button>
      <button onClick={() => bridge.unmount()}>Unmount</button>
      <button onClick={() => bridge.update({ config: { theme: WidgetTheme.LIGHT } })}>Update Config Light</button>
      <button onClick={() => bridge.update({ config: { theme: WidgetTheme.DARK } })}>Update Config Dark</button>
    </div>
  );
}

export default BridgeUI;

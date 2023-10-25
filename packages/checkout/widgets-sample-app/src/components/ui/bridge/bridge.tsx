import { Checkout, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets'
import { useEffect, useMemo, useState } from 'react';

const BRIDGE_TARGET_ID = 'bridge-widget-target';
function BridgeUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);
  const bridge = useMemo(() => factory.create(WidgetType.BRIDGE, {fromContractAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a'}),[factory])
  const [provider, setProvider] = useState();
  
  useEffect(() => {
    bridge.mount(BRIDGE_TARGET_ID)
  }, [bridge])
  
  return (
    <div>
      <h1 className="sample-heading">Checkout Bridge</h1>
      <div id={BRIDGE_TARGET_ID}></div>
      <button onClick={() => bridge.mount(BRIDGE_TARGET_ID)}>Mount</button>
      <button onClick={() => bridge.unmount()}>Unmount</button>
    </div>
  );
}

export default BridgeUI;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Checkout,
  ConnectTargetLayer,
  WidgetType,
  WidgetTheme,
  Widget,
  ConnectEventType
} from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

const CONNECT_TARGET_ID = "connect-widget-target";
function ConnectUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), []);
  const connect = useMemo(() => factory.create(WidgetType.CONNECT, {targetLayer: ConnectTargetLayer.LAYER2}), [factory]);
  const [provider, setProvider] = useState();
  
  useEffect(() => {
    connect.mount(CONNECT_TARGET_ID)
    connect.on(ConnectEventType.SUCCESS,(data) => {
      setProvider(data.provider);
    })
  }, [connect])

  return (
    <div>
      <h1 className="sample-heading">Checkout Connect</h1>
      <div id={CONNECT_TARGET_ID}></div>
      <button onClick={() => connect.mount(CONNECT_TARGET_ID)}>Mount</button>
      <button onClick={() => connect.unmount()}>Unmount</button>
    </div>
  );
}

export default ConnectUI;

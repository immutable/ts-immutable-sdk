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
import { Environment } from '@imtbl/config';

const CONNECT_TARGET_ID = "connect-widget-target";
function ConnectUI() {
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: Environment.SANDBOX } }), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);
  const connect = useMemo(() => factory.create(WidgetType.CONNECT, {targetLayer: ConnectTargetLayer.LAYER2}), [factory]);
  const [provider, setProvider] = useState();
  
  useEffect(() => {
    connect.update({ config: { theme: WidgetTheme.LIGHT }})
    connect.mount(CONNECT_TARGET_ID)
    connect.on(ConnectEventType.SUCCESS,(data) => {
      console.log('SUCCESS')
      setProvider(data.provider);
    })
    connect.on(ConnectEventType.CLOSE_WIDGET,(data) => {
      console.log('CLOSE_WIDGET')
    })
    connect.removeListener(ConnectEventType.CLOSE_WIDGET)
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

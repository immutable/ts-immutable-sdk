import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Checkout,
  ConnectTargetLayer,
  WidgetType,
  WidgetTheme,
  Widget,
  ConnectEventType
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

const CONNECT_TARGET_ID = "connect-widget-target";
function ConnectUI() {
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: Environment.SANDBOX } }), []);
  const [factory, setFactory] = useState<ImmutableCheckoutWidgets.WidgetsFactory>();
  const connect = useMemo(() => {
    if(!factory) return;
    return (factory as any).create(WidgetType.CONNECT, {})
  }, [factory]);
  const [provider, setProvider] = useState();

  useEffect(() => {
    (async () => {
      setFactory(await checkout.widgets({config: {theme: WidgetTheme.DARK}}));
    })()
  }, [checkout]);

  useEffect(() => {
    if(!connect) return;
    connect.mount(CONNECT_TARGET_ID)
    connect.addListener(ConnectEventType.SUCCESS, (data: any) => {
      console.log('SUCCESS')
      setProvider(data.provider);
    })
    connect.addListener(ConnectEventType.CLOSE_WIDGET, (data: any) => {
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

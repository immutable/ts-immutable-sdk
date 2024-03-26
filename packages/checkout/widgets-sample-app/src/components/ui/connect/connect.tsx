import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Checkout,
  WidgetType,
  WidgetTheme,
  ConnectEventType
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

const CONNECT_TARGET_ID = "connect-widget-target";
function ConnectUI() {
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: Environment.SANDBOX } }), []);
  const [factory, setFactory] = useState<ImmutableCheckoutWidgets.WidgetsFactory>();
  const connect = useMemo(() => {
    if(!factory) return;
    return (factory).create(WidgetType.CONNECT)
  }, [factory]);
  const [provider, setProvider] = useState();

  useEffect(() => {
    (async () => {
      setFactory(new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}));
    })()
  }, [checkout]);

  useEffect(() => {
    if(!connect) return;
    connect.mount(CONNECT_TARGET_ID, {})
    connect.addListener(ConnectEventType.SUCCESS, (data: any) => {
      setProvider(data.provider);
    })
    connect.addListener(ConnectEventType.CLOSE_WIDGET, (data: any) => {
      connect.unmount();
    })
  }, [connect])

  return (
    <div>
      <h1 className="sample-heading">Checkout Connect</h1>
      <div id={CONNECT_TARGET_ID}></div>
      <button onClick={() => connect?.mount(CONNECT_TARGET_ID)}>Mount</button>
      <button onClick={() => connect?.unmount()}>Unmount</button>
      <button onClick={() => connect?.update({ config: { language: 'en'}})}>EN</button>
      <button onClick={() => connect?.update({ config: { language: 'ja'}})}>JA</button>
      <button onClick={() => connect?.update({ config: { language: 'ko'}})}>KO</button>
      <button onClick={() => connect?.update({ config: { language: 'zh'}})}>ZH</button>
    </div>
  );
}

export default ConnectUI;

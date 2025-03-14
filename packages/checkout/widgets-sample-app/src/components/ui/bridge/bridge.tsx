import { BridgeEventType, Checkout, WidgetTheme, WidgetType, WidgetLanguage, Widget } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets'
import { Environment } from '@imtbl/config';
import { useEffect, useMemo, useState } from 'react';
import { passport } from '../../../utils/passport';

const BRIDGE_TARGET_ID = 'bridge-widget-target';
function BridgeUI() {
  const [bridge, setBridge] = useState<Widget<WidgetType.BRIDGE> | null>(null);

  useEffect(() => {
    passport.connectEvm().then(() => {
      const checkout = new Checkout({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        passport,
      });
      const factory = new WidgetsFactory(checkout, { theme: WidgetTheme.DARK });
      setBridge(factory.create(WidgetType.BRIDGE));
    })
  }, []);

  useEffect(() => {
    if (!bridge) return;
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

  if (!bridge) return null;

  return (
    <div>
      <h1 className="sample-heading">Checkout Bridge</h1>
      <div id={BRIDGE_TARGET_ID}></div>
      <button onClick={() => bridge.mount(BRIDGE_TARGET_ID, { amount: '10' })}>Mount</button>
      <button onClick={() => bridge.unmount()}>Unmount</button>
      <button onClick={() => bridge.update({ config: { theme: WidgetTheme.LIGHT } })}>Update Config Light</button>
      <button onClick={() => bridge.update({ config: { theme: WidgetTheme.DARK } })}>Update Config Dark</button>
      <select
        onChange={(e) =>
          bridge.update({
            config: { language: e.target.value as WidgetLanguage },
          })
        }
      >
        <option value="en">EN</option>
        <option value="ja">JA</option>
        <option value="ko">KO</option>
        <option value="zh">ZH</option>
      </select>
    </div>
  );
}

export default BridgeUI;

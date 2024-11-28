import { Checkout, PurchaseEventType, WidgetLanguage, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { useEffect, useMemo } from 'react';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

const PURCHASE_WIDGET_ID = 'purchase';

export default function PurchaseUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }), [checkout]);
  const purchase = useMemo(() => factory.create(WidgetType.PURCHASE), [factory]);

  useEffect(() => {
    purchase.mount(PURCHASE_WIDGET_ID, {});

    purchase.addListener(PurchaseEventType.CLOSE_WIDGET, (data: any) => {
      console.log("CLOSE_WIDGET", data);
      purchase.unmount();
    });

    purchase.addListener(PurchaseEventType.CONNECT_SUCCESS, (data: any) => {
      console.log("CONNECT_SUCCESS", data);
    });

    return () => {
      purchase.removeListener(PurchaseEventType.CLOSE_WIDGET);
      purchase.removeListener(PurchaseEventType.CONNECT_SUCCESS);
    }
  }, [purchase]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Purchase</h1>

      <div id={PURCHASE_WIDGET_ID}></div>
      <button onClick={() => purchase.mount(PURCHASE_WIDGET_ID, {})}>Mount</button>
      <button onClick={() => purchase.unmount()}>Unmount</button>
      <button onClick={() => purchase.update({ config: { theme: WidgetTheme.LIGHT } })}>Update Config Light</button>
      <button onClick={() => purchase.update({ config: { theme: WidgetTheme.DARK } })}>Update Config Dark</button>
      <select
        onChange={(e) =>
          purchase.update({
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

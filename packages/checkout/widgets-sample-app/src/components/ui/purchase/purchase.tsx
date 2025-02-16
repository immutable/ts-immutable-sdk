import { Checkout, PurchaseEventType, PurchaseItem, WidgetLanguage, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { useEffect, useMemo } from 'react';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { passport } from "../../../utils/passport";
import { Environment } from '@imtbl/config';


const PURCHASE_WIDGET_ID = 'purchase';

const defaultItems: PurchaseItem[] = [
  {
    productId: "lootbox",
    qty: 1,
    name: "Lootbox",
    image: "https://strong-alligator.static.domains/lootbox.png",
    description: "A common lootbox",
  },
];

export default function PurchaseUI() {
  const urlParams = new URLSearchParams(window.location.search);
  const environmentId = urlParams.get('environmentId') as string;

  const checkout = useMemo(
    () =>
      new Checkout({
        baseConfig: {
          environment: Environment.PRODUCTION,
        },
        passport,
      }),
    []
  );

    const factory = useMemo(
    () =>
      new WidgetsFactory(checkout, {
        walletConnect: {
          projectId: "938b553484e344b1e0b4bb80edf8c362",
          metadata: {
            name: "Checkout Marketplace",
            description: "Checkout Marketplace",
            url: "http://localhost:3000/marketplace-orchestrator",
            icons: [],
          },
        },
      }),
    [checkout]
  );

  const purchase = useMemo(() => factory.create(WidgetType.PURCHASE), [factory]);

  useEffect(() => {
    passport.connectEvm();
  }, []);

  useEffect(() => {
    purchase.mount(PURCHASE_WIDGET_ID, {
      environmentId,
      items: defaultItems,
    });

    purchase.addListener(PurchaseEventType.CLOSE_WIDGET, (data: any) => {
      console.log('CLOSE_WIDGET', data);
      purchase.unmount();
    });

    purchase.addListener(PurchaseEventType.CONNECT_SUCCESS, (data: any) => {
      console.log('CONNECT_SUCCESS', data);
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
      <button onClick={() => purchase.mount(PURCHASE_WIDGET_ID, { environmentId, items: defaultItems })}>Mount</button>
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

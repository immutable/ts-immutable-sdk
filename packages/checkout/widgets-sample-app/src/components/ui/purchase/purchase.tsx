import { Checkout, PurchaseEventType, PurchaseItem, WidgetLanguage, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { useEffect, useMemo } from 'react';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { passport } from "../../../utils/passport";
import { Environment } from '@imtbl/config';


const PURCHASE_WIDGET_ID = 'purchase';

const defaultItems: PurchaseItem[] = [
  {
    productId: "kangaroo",
    qty: 1,
    name: "Kangaroo",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-10-1.png",
    description: "Kangaroo",
  },
  {
    productId: "kookaburra",
    qty: 3,
    name: "Kookaburra",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-4-1.png",
    description: "Kookaburra",
  },
  {
    productId: "quokka",
    qty: 2,
    name: "Quokka",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-8-1.png",
    description: "Quokka",
  },
  {
    productId: "ibis",
    qty: 1,
    name: "Ibis",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-1-1.png",
    description: "Ibis",
  },
  {
    productId: "emu",
    qty: 5,
    name: "Emu",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-5-1.png",
    description: "Emu",
  },
];

export default function PurchaseUI() {
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

  const factory = useMemo(() => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }), [checkout]);
  const purchase = useMemo(() => factory.create(WidgetType.PURCHASE), [factory]);

  useEffect(() => {
    purchase.mount(PURCHASE_WIDGET_ID, {
      items: defaultItems,
      },
    );

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
      <button onClick={() => purchase.mount(PURCHASE_WIDGET_ID, {items: defaultItems})}>Mount</button>
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

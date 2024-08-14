import {
  Checkout,
  WidgetTheme,
  WidgetType,
  WidgetLanguage,
  AddFundsEventType,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { useMemo, useEffect } from "react";

const Add_FUNDS_TARGET_ID = "add-funds-widget-target";

function AddFundsUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(
    () => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }),
    [checkout]
  );
  const addFunds = useMemo(
    () => factory.create(WidgetType.ADD_FUNDS),
    [factory]
  );

  useEffect(() => {
    addFunds.mount(Add_FUNDS_TARGET_ID);
    addFunds.addListener(AddFundsEventType.CLOSE_WIDGET, (data: any) => {
      console.log("CLOSE_WIDGET", data);
      addFunds.unmount();
    });
  }, [addFunds]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Add Funds</h1>
      <div id={Add_FUNDS_TARGET_ID}></div>
      <button onClick={() => addFunds.mount(Add_FUNDS_TARGET_ID)}>Mount</button>
      <button onClick={() => addFunds.unmount()}>Unmount</button>
      <button
        onClick={() =>
          addFunds.update({ config: { theme: WidgetTheme.LIGHT } })
        }
      >
        Update Config Light
      </button>
      <button
        onClick={() => addFunds.update({ config: { theme: WidgetTheme.DARK } })}
      >
        Update Config Dark
      </button>
      <select
        onChange={(e) =>
          addFunds.update({
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

export default AddFundsUI;

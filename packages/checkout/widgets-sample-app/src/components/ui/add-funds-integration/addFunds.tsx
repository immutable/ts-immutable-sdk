import {
  AddFundsEventType,
  OnRampEventType,
  SwapEventType,
  BridgeEventType, WidgetTheme, WidgetLanguage,
} from "@imtbl/checkout-sdk";
import { useEffect } from "react";
import { useWidgets } from "../../../context/widgets";
import { usePassport } from "../../../context/passport";

const ADD_FUNDS_TARGET_ID = "add-funds-widget-target";

function AddFundsIntegration() {
  const { addFunds, onRamp, swap, bridge } = useWidgets();
  const { backToGame } = usePassport();

  useEffect(() => {
    if (!addFunds) return;
    addFunds.mount(ADD_FUNDS_TARGET_ID, {
      showSwapOption:false,
      toAmount: "10",
      toTokenAddress: "0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439",
    });
    addFunds.addListener(AddFundsEventType.CLOSE_WIDGET, (data: any) => {
      console.log("CLOSE_WIDGET", data);
      backToGame();
      addFunds.unmount();
    });
    addFunds.addListener(AddFundsEventType.REQUEST_ONRAMP, (data: any) => {
      console.log("REQUEST_ONRAMP", data);
      addFunds.unmount();
      onRamp?.addListener(OnRampEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        onRamp?.unmount();
      });
      onRamp?.mount(ADD_FUNDS_TARGET_ID, {});
    });
    addFunds.addListener(AddFundsEventType.REQUEST_SWAP, (data: any) => {
      console.log("REQUEST_SWAP", data);
      addFunds.unmount();
      swap?.addListener(SwapEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        swap.unmount();
      });
      swap?.mount(ADD_FUNDS_TARGET_ID, {});
    });
    addFunds.addListener(AddFundsEventType.REQUEST_BRIDGE, (data: any) => {
      console.log("REQUEST_BRIDGE", data);
      addFunds.unmount();
      bridge?.addListener(BridgeEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        bridge.unmount();
      });
      bridge?.mount(ADD_FUNDS_TARGET_ID, {});
    });
  }, [addFunds]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Add Funds</h1>
      <div id={ADD_FUNDS_TARGET_ID}></div>
      <button onClick={() => addFunds?.mount(ADD_FUNDS_TARGET_ID)}>Mount</button>
      <button onClick={() => addFunds?.unmount()}>Unmount</button>
      <button
        onClick={() =>
          addFunds?.update({ config: { theme: WidgetTheme.LIGHT } })
        }
      >
        Update Config Light
      </button>
      <button
        onClick={() => addFunds?.update({ config: { theme: WidgetTheme.DARK } })}
      >
        Update Config Dark
      </button>
      <select
        onChange={(e) =>
          addFunds?.update({
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

export default AddFundsIntegration;

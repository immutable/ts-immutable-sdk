import {
  Checkout,
  WidgetTheme,
  WidgetType,
  WidgetLanguage,
  AddFundsEventType,
  OnRampEventType,
  SwapEventType,
  BridgeEventType, WalletProviderName,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Web3Provider } from "@ethersproject/providers";

const ADD_FUNDS_TARGET_ID = "add-funds-widget-target";

function AddFundsUI() {
  const [searchParams, setSearchParams] = useSearchParams();

  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(
    () => new WidgetsFactory(checkout,{}),
    [checkout]
  );

  const addFunds = useMemo(
    () => factory.create(WidgetType.ADD_FUNDS, {
      config: { theme: WidgetTheme.DARK },
    }),
    [factory]
  );
  const onRamp = useMemo(() => factory.create(WidgetType.ONRAMP), [factory]);
  const swap = useMemo(() => factory.create(WidgetType.SWAP), [factory]);
  const bridge = useMemo(() => factory.create(WidgetType.BRIDGE), [factory]);

  useEffect(() => {
    addFunds.mount(ADD_FUNDS_TARGET_ID, {
      showSwapOption:false,
      amount: "10",
      tokenAddress: "0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439",
    });
    addFunds.addListener(AddFundsEventType.GO_BACK, (data: any) => {
      console.log("GO_BACK", data);
    });
    addFunds.addListener(AddFundsEventType.CLOSE_WIDGET, (data: any) => {
      console.log("CLOSE_WIDGET", data);
      addFunds.unmount();
    });
    addFunds.addListener(AddFundsEventType.REQUEST_ONRAMP, (data: any) => {
      console.log("REQUEST_ONRAMP", data);
      addFunds.unmount();
      onRamp.addListener(OnRampEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        onRamp.unmount();
      });
      onRamp.mount(ADD_FUNDS_TARGET_ID, {});
      setSearchParams({'view': 'onramp'})
    });
    addFunds.addListener(AddFundsEventType.REQUEST_SWAP, (data: any) => {
      console.log("REQUEST_SWAP", data);
      addFunds.unmount();
      swap.addListener(SwapEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        swap.unmount();
      });
      swap.mount(ADD_FUNDS_TARGET_ID, {});
    });
    addFunds.addListener(AddFundsEventType.REQUEST_BRIDGE, (data: any) => {
      console.log("REQUEST_BRIDGE", data);
      addFunds.unmount();
      bridge.addListener(BridgeEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        bridge.unmount();
      });
      bridge.mount(ADD_FUNDS_TARGET_ID, {});
    });
  }, [addFunds]);

  return (
    <div>
      {/* <h1 className="sample-heading">Checkout Add Funds</h1> */}
      <div id={ADD_FUNDS_TARGET_ID}></div>
      {/* <button onClick={() => addFunds.mount(ADD_FUNDS_TARGET_ID)}>Mount</button> */}
      {/* <button onClick={() => addFunds.unmount()}>Unmount</button> */}
      {/* <button */}
      {/*   onClick={() => */}
      {/*     addFunds.update({ config: { theme: WidgetTheme.LIGHT } }) */}
      {/*   } */}
      {/* > */}
      {/*   Update Config Light */}
      {/* </button> */}
      {/* <button */}
      {/*   onClick={() => addFunds.update({ config: { theme: WidgetTheme.DARK } })} */}
      {/* > */}
      {/*   Update Config Dark */}
      {/* </button> */}
      {/* <select */}
      {/*   onChange={(e) => */}
      {/*     addFunds.update({ */}
      {/*       config: { language: e.target.value as WidgetLanguage }, */}
      {/*     }) */}
      {/*   } */}
      {/* > */}
      {/*   <option value="en">EN</option> */}
      {/*   <option value="ja">JA</option> */}
      {/*   <option value="ko">KO</option> */}
      {/*   <option value="zh">ZH</option> */}
      {/* </select> */}
    </div>
  );
}

export default AddFundsUI;

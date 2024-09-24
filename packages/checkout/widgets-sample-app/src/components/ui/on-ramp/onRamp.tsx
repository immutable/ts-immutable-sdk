import {
  Checkout,
  OnRampEventType,
  WidgetTheme,
  WidgetType,
} from "@imtbl/checkout-sdk";
import { useEffect, useMemo, useState } from "react";
import { WidgetsFactory } from "@imtbl/checkout-widgets";

function OnRampUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const onRamp = useMemo(
    () => new WidgetsFactory(checkout, {}).create(WidgetType.ONRAMP),
    [checkout]
  );
  const [skipConnect, setSkipConnect] = useState<boolean>(false);
  const [toWalletAddress, setToWalletAddress] = useState<string>("");

  const unmount = () => {
    onRamp.unmount();
  };
  const mount = () => {
    onRamp.mount("onramp", {
      amount: "55",
      tokenAddress: "0x0000000000000000000000000000000000001010",
      skipConnect,
      toWalletAddress,
    });
  };
  const update = (theme: WidgetTheme) => {
    onRamp.update({ config: { theme } });
  };

  useEffect(() => {
    // if skipConnect is true, wait until toWalletAddress is set
    if (skipConnect && !toWalletAddress) return;

    mount();
    onRamp.addListener(OnRampEventType.SUCCESS, (data) => {
      console.log("SUCCESS", data);
    });
    onRamp.addListener(OnRampEventType.FAILURE, (data) => {
      console.log("FAILURE", data);
    });
    onRamp.addListener(OnRampEventType.CLOSE_WIDGET, () => {
      unmount();
    });
  }, [skipConnect]);

  return (
    <div>
      <h1 className="sample-heading">Checkout OnRamp</h1>
      <div id="onramp"></div>
      <button onClick={unmount}>Unmount</button>
      <button onClick={mount}>Mount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>
        Update Config Light
      </button>
      <button onClick={() => update(WidgetTheme.DARK)}>
        Update Config Dark
      </button>
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => {
            unmount();
            setSkipConnect((prev) => !prev);
          }}
        >
          Skip Connect {skipConnect ? "ON" : "OFF"}
        </button>
        {skipConnect && !toWalletAddress && (
          <p>Please enter a destination wallet address:</p>
        )}
        {skipConnect && (
          <input
            placeholder="To Wallet Address"
            type="text"
            value={toWalletAddress}
            onChange={(e) => setToWalletAddress(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

export default OnRampUI;

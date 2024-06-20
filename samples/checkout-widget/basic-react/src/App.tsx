import { useEffect, useState } from "react";
import { checkout } from "@imtbl/sdk";

// create Checkout SDK
const checkoutSDK = new checkout.Checkout();

export function App() {
  const [connect, setConnect] =
    useState<checkout.Widget<typeof checkout.WidgetType.CONNECT>>();

  // Initialise widgets, create connect widget
  useEffect(() => {
    (async () => {
      const widgets = await checkoutSDK.widgets({
        config: { theme: checkout.WidgetTheme.DARK },
      });
      const connect = widgets.create(checkout.WidgetType.CONNECT, {
        config: { theme: checkout.WidgetTheme.DARK },
      });
      setConnect(connect);
    })();
  }, []);

  // mount connect widget and add event listeners
  useEffect(() => {
    if (!connect) return;

    connect.mount("connect");

    connect.addListener(
      checkout.ConnectEventType.SUCCESS,
      (data: checkout.ConnectionSuccess) => {
        console.log("success", data);
      }
    );
    connect.addListener(
      checkout.ConnectEventType.FAILURE,
      (data: checkout.ConnectionFailed) => {
        console.log("failure", data);
      }
    );
    connect.addListener(checkout.ConnectEventType.CLOSE_WIDGET, () => {
      connect.unmount();
    });
  }, [connect]);

  return <div id="connect" />;
}

export default App;

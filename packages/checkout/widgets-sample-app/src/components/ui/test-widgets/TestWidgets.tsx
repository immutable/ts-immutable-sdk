import { Button } from "@biom3/react";
import { CheckoutWidgetsConfig, StrongCheckoutWidgetsConfig, WidgetTheme, Widgets } from "@imtbl/checkout-widgets";
import { Environment } from "@imtbl/config";
import { Passport } from "@imtbl/passport";
import React, { useCallback, useEffect, useMemo } from "react"
import { passportConfig } from "../marketplace-orchestrator/passportConfig";

const widgetConfig: CheckoutWidgetsConfig = {
  environment: Environment.SANDBOX,
  theme: WidgetTheme.DARK,
  isBridgeEnabled: true,
  isSwapEnabled: true,
  isOnRampEnabled: true
}

const connectId = 'my-connect-widget';
export function TestWidgets() {

  const passport = useMemo(() => new Passport(passportConfig),[])

  const widgets = useMemo(() => new Widgets(widgetConfig),[widgetConfig]);

  const mount = () => widgets.connect.mount(connectId, {targetLayer: 'LAYER1'})

  const update = () => widgets.connect.update({targetLayer: 'LAYER2', passport})

  const updateConfig = () => widgets.connect.updateConfig({theme: WidgetTheme.LIGHT});

  const hide = () => widgets.connect.hide();

  const show = () => widgets.connect.show();

  const unmount = () => widgets.connect.unmount();

  return (
    <div>
      <div id={connectId} />
      <button onClick={mount}>Mount</button>
      <button onClick={update}>Update</button>
      <button onClick={updateConfig}>Update config</button>
      <button onClick={hide}>Hide</button>
      <button onClick={show}>Show</button>
      <button onClick={unmount}>Unmount</button>
    </div>
  )
}
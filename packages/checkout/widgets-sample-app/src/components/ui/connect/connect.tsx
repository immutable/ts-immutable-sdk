import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Checkout,
  ConnectTargetLayer,
  WidgetType,
  WidgetTheme,
  Widget
} from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';

function ConnectUI() {
  const [provider, setProvider] = useState();
  const checkout = useMemo(() => new Checkout(), []);
  
  const [connectWidget, setConnectWidget] = useState<Widget | undefined>();
  const [factory, setFactory] = useState<any>();
  const [theme, setTheme] = useState(WidgetTheme.DARK);
  const firstRender = useRef(true);
  
  useEffect(() => {
    if(firstRender.current){
      firstRender.current = false;
      (async () => {
        const factory = new WidgetsFactory(checkout, {theme: WidgetTheme.DARK})
        const connect = factory.create(WidgetType.CONNECT, {targetLayer: ConnectTargetLayer.LAYER2})
        const bridge = factory.create(WidgetType.BRIDGE, {fromContractAddress: "0x2Fa06C6672dDCc066Ab04631192738799231dE4a"})

        setFactory(factory);
        setConnectWidget(connect);
        connect.mount("connect", {})
        bridge.mount("bridge", {})
        
      })()
    }
    
  }, [checkout, firstRender])

  const updateTheme = useCallback((widgetTheme: WidgetTheme) => {
    let newTheme = widgetTheme === WidgetTheme.DARK ? WidgetTheme.LIGHT : WidgetTheme.DARK;
    connectWidget?.updateConfig({theme: newTheme});
    setTheme(newTheme);
  }, [connectWidget])

  const updateThemeForAll = useCallback((widgetTheme: WidgetTheme) => {
    let newTheme = widgetTheme === WidgetTheme.DARK ? WidgetTheme.LIGHT : WidgetTheme.DARK;
    factory?.update({theme: newTheme});
    setTheme(newTheme);
  }, [factory])

  return (
    <div>
      <h1 className="sample-heading">Checkout Connect</h1>
      <div id="connect"></div>
      <div id="bridge"></div>
      <button onClick={() => updateThemeForAll(theme)}>Toggle theme</button>
    </div>
  );
}

export default ConnectUI;

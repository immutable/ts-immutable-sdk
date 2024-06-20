import { Checkout, SwapEventType, SwapSuccess, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { useEffect, useMemo } from 'react';

const SWAP_TARGET_ID = 'swap-target'
function SwapUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);
  const swap = useMemo(() => factory.create(WidgetType.SWAP),[factory]);

  const updateTheme = (theme: WidgetTheme) => swap.update({config: {theme}});
  
  useEffect(() => {
    swap.mount(SWAP_TARGET_ID,{amount: '5', fromTokenAddress: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57', toTokenAddress: "0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439"});
    swap.addListener(SwapEventType.SUCCESS, (data: SwapSuccess) => {
    })
    swap.addListener(SwapEventType.FAILURE, (data: any) => {
      console.log('FAILURE', data);
    });
    swap.addListener(SwapEventType.CLOSE_WIDGET, (data: any) => {
      swap.unmount();
    });
  }, [swap])

  return (
    <div>
      <h1 className="sample-heading">Checkout Swap</h1>
      <div id={SWAP_TARGET_ID}></div>
      <button onClick={() => swap.mount(SWAP_TARGET_ID)}>Mount</button>
      <button onClick={() => swap.unmount()}>Unmount</button>
      <button onClick={() => updateTheme(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => updateTheme(WidgetTheme.DARK)}>Dark theme</button>
    </div>
  );
}

export default SwapUI;

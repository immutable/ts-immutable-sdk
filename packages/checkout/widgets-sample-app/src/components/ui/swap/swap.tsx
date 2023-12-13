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
    swap.mount(SWAP_TARGET_ID,{amount: '10', fromTokenAddress: 'native', toTokenAddress: "0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c"});
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

import { Checkout, SwapDirection, SwapEventType, SwapSuccess, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { useEffect, useMemo, useState } from 'react';

const SWAP_TARGET_ID = 'swap-target'
function SwapUI() {
  const checkout = useMemo(() => new Checkout(), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout]);
  const swap = useMemo(() => factory.create(WidgetType.SWAP),[factory]);
  const [isAutoProceed, setIsAutoProceed] = useState(false);

  const updateTheme = (theme: WidgetTheme) => swap.update({config: {theme}});
  
  useEffect(() => {
    swap.mount(SWAP_TARGET_ID,{
      amount: '5',
      // fromTokenAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
      fromTokenAddress: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
      toTokenAddress: "0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439",
      autoProceed: isAutoProceed,
      direction: SwapDirection.FROM
    });
    swap.addListener(SwapEventType.SUCCESS, (data: SwapSuccess) => {
    })
    swap.addListener(SwapEventType.FAILURE, (data: any) => {
      console.log('FAILURE', data);
    });
    swap.addListener(SwapEventType.CLOSE_WIDGET, (data: any) => {
      swap.unmount();
    });
  }, [swap, isAutoProceed])

  const handleAutoProceedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsAutoProceed(event.target.value === 'true');
  };

  return (
    <div>
      <h1 className="sample-heading">Checkout Swap</h1>
      <div id={SWAP_TARGET_ID}></div>
      <button onClick={() => swap.mount(SWAP_TARGET_ID)}>Mount</button>
      <button onClick={() => swap.unmount()}>Unmount</button>
      <button onClick={() => updateTheme(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => updateTheme(WidgetTheme.DARK)}>Dark theme</button>
      Auto Proceed:
      <select value={isAutoProceed.toString()} onChange={handleAutoProceedChange}>
        <option value="false">False</option>
        <option value="true">True</option>
      </select>
    </div>
  );
}

export default SwapUI;
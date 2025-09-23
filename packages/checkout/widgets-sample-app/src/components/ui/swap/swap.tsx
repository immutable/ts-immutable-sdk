import { Checkout, SwapEventType, SwapSuccess, Widget, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { useCallback, useEffect, useState } from 'react';
import { passport } from '../../../utils/passport';
import { Environment } from '@imtbl/config';

const SWAP_TARGET_ID = 'swap-target'
function SwapUI() {
  const urlParams = new URLSearchParams(window.location.search);

  const [swap, setSwap] = useState<Widget<WidgetType.SWAP> | null>(null);
  const [isAutoProceed, setIsAutoProceed] = useState(urlParams.get('isAutoProceed') == 'true');

  const updateTheme = useCallback((theme: WidgetTheme) => swap?.update({config: {theme}}), [swap]);

  useEffect(() => {
    passport.connectEvm().then(() => {
      const checkout = new Checkout({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        passport,
      });
      const factory = new WidgetsFactory(checkout, { theme: WidgetTheme.DARK });
      setSwap(factory.create(WidgetType.SWAP));
    })
  }, []);

  useEffect(() => {
    if (!swap) return;
    swap.mount(SWAP_TARGET_ID,{
      // amount: '5',
      // fromTokenAddress: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
      // toTokenAddress: "0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439",
      autoProceed: isAutoProceed,
      showBackButton: false,
      showTitle: false,
      showSubTitle: false,
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
      <button onClick={() => swap?.mount(SWAP_TARGET_ID)}>Mount</button>
      <button onClick={() => swap?.unmount()}>Unmount</button>
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

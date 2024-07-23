import { Checkout, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { useEffect, useMemo } from 'react';
import { Environment } from '@imtbl/config';

function CheckoutUI() {
  const checkout = useMemo(() => new Checkout({ baseConfig: { environment: Environment.SANDBOX } }), []);
  const factory = useMemo(() => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }), [checkout]);
  const checkoutWidget = useMemo(() => factory.create(WidgetType.CHECKOUT), [checkout])

  const unmount = () => { checkoutWidget.unmount() }
  const mount = () => { checkoutWidget.mount('checkout') }
  const update = (theme: WidgetTheme) => { checkoutWidget.update({ config: { theme } }) }

  useEffect(() => {
    mount();
  }, []);

  return (
    <div>
      <h1 className="sample-heading">Checkout Widget</h1>
      <div id="checkout"></div>
      <button onClick={unmount}>Unmount</button>
      <button onClick={mount}>Mount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>

    </div>
  );
}

export default CheckoutUI;

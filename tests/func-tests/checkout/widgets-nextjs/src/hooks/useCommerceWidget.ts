import { Web3Provider } from '@ethersproject/providers';
import { checkout } from '@imtbl/sdk';
import { Widget, WidgetType } from '@imtbl/sdk/checkout';
import { useState, useEffect, useMemo } from 'react';
import { MockProvider } from '../app/utils/mockProvider';

const checkoutSDK = new checkout.Checkout();

export function useCommerceWidget() {
  const [widget, setWidget] = useState<Widget<WidgetType.IMMUTABLE_COMMERCE>>();
  const [factory, setFactory] = useState<ImmutableCheckoutWidgets.WidgetsFactory>();


  useEffect(() => {
    const loadWidgets = async () => {
      const widgetsFactory = await checkoutSDK.widgets({ 
        config: {},
      });

      const widget = widgetsFactory.create(WidgetType.IMMUTABLE_COMMERCE, {})
      setWidget(widget);
      setFactory(widgetsFactory);
    }

    loadWidgets();
  }, []);



  return { widget, factory };
}
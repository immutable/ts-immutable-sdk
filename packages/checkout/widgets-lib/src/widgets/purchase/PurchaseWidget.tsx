import { PurchaseWidgetParams } from '@imtbl/checkout-sdk';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';

export type PurchaseWidgetInputs = PurchaseWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
};

export default function PurchaseWidget() {
  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack
        />
    )}
      bodyStyleOverrides={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '0',
      }}
    />
  );
}

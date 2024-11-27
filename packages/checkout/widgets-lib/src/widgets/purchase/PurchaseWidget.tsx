import { PurchaseWidgetParams } from '@imtbl/checkout-sdk';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';

export type PurchaseWidgetInputs = PurchaseWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
};

export default function PurchaseWidget({ config }: PurchaseWidgetInputs) {
  // eslint-disable-next-line no-console
  console.log({ config });

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

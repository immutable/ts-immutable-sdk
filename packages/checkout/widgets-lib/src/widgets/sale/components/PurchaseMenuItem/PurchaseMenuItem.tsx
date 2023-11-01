import { Heading, MenuItem } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useSaleContext } from '../../context/SaleContextProvider';
import { tokenValueFormat } from '../../../../lib/utils';
import { text } from '../../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';

type PurchaseMenuItemProps = {
  fundingRoute: FundingRoute;
};

export function PurchaseMenuItem({ fundingRoute }: PurchaseMenuItemProps) {
  const textConfig = text.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];
  const { items } = useSaleContext();
  const firstItem = items[0];
  const firstFundingStep = fundingRoute.steps[0];

  // todo - grab from url params, waiting for changes to how widgets are being loaded wt-1860
  const collection = 'Metalcore';

  // todo - calculate these in useSmartCheckout hook - later PR
  const purchaseAmount = '0.000431';
  const usdPurchaseAmount = '2.49';

  return (
    <MenuItem
      emphasized
      testId="funding-route-purchase-item"
      size="medium"
    >
      <MenuItem.FramedImage
        imageUrl={firstItem.image}
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        price={`${firstFundingStep.fundingItem.token.symbol} 
          ${tokenValueFormat(purchaseAmount)}`}
        fiatAmount={`${textConfig.currency.usdEstimate}${usdPurchaseAmount}`}
      />
      <MenuItem.Label>
        {firstItem.name}
        {firstItem.qty > 1 ? ` x${firstItem.qty}` : null}
      </MenuItem.Label>
      <MenuItem.Caption>
        {collection}
      </MenuItem.Caption>
    </MenuItem>
  );
}

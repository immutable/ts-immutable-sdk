import { Heading, MenuItem } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { useSaleContext } from '../../context/SaleContextProvider';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../../lib/utils';
import { text } from '../../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';
import { CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';

type PurchaseMenuItemProps = {
  fundingRoute: FundingRoute;
};

export function PurchaseMenuItem({ fundingRoute }: PurchaseMenuItemProps) {
  const textConfig = text.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];
  const { items } = useSaleContext();
  const firstItem = items[0];
  const firstFundingStep = fundingRoute.steps[0];
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [usdPurchaseAmount, setUsdPurchaseAmount] = useState<string | undefined>(undefined);

  // todo - grab from url params, waiting for changes to how widgets are being loaded wt-1860
  const collection = 'Metalcore';

  useEffect(() => {
    if (!cryptoFiatState.conversions) {
      return;
    }

    // ! cryptoFiatState not working currently - stubbing
    cryptoFiatState.conversions = new Map<string, number>(
      [['eth', 100], ['imx', 100000], ['zktkn', 100000], ['timx', 100000], ['zkone', 100000]],
    );

    setUsdPurchaseAmount(
      calculateCryptoToFiat(
        firstFundingStep.fundingItem.fundsRequired.formattedAmount,
        firstFundingStep.fundingItem.token.symbol,
        cryptoFiatState.conversions,
      ),
    );
  }, [cryptoFiatState, fundingRoute]);

  return (
    <MenuItem
      emphasized
      testId="funding-route-purchase-item"
      size="medium"
    >
      <MenuItem.FramedImage
        imageUrl={firstItem?.image}
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        price={`${firstFundingStep?.fundingItem.token.symbol} 
          ${tokenValueFormat(firstFundingStep.fundingItem.fundsRequired.formattedAmount)}`}
        fiatAmount={`${textConfig.currency.usdEstimate}${usdPurchaseAmount}`}
      />
      <MenuItem.Label>
        {firstItem?.name}
        {firstItem?.qty > 1 ? ` x${firstItem.qty}` : null}
      </MenuItem.Label>
      <MenuItem.Caption>
        {collection}
      </MenuItem.Caption>
    </MenuItem>
  );
}

import { Heading, MenuItem } from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { useSaleContext } from '../../context/SaleContextProvider';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../../lib/utils';
import { CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';

type PurchaseMenuItemProps = {
  currency: SaleWidgetCurrency;
  collectionName: string;
};

export function PurchaseMenuItem({
  currency,
  collectionName,
}: PurchaseMenuItemProps) {
  const { t } = useTranslation();
  const { items, amount } = useSaleContext();
  // const firstFundingStep = fundingRoute.steps[0];
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [usdPurchaseAmount, setUsdPurchaseAmount] = useState<
  string | undefined
  >(undefined);

  useEffect(() => {
    if (!cryptoFiatState.conversions) {
      return;
    }
    try {
      setUsdPurchaseAmount(
        calculateCryptoToFiat(
          `${amount}`,
          currency.symbol,
          cryptoFiatState.conversions,
        ),
      );
    } catch {
      setUsdPurchaseAmount(undefined);
    }
  }, [cryptoFiatState, currency]);

  return (
    <>
      {items.map((item) => (
        <MenuItem
          emphasized
          testId="funding-route-purchase-item"
          size="medium"
          key={`${item.name}-${currency.name}-${currency.symbol}`}
        >
          <MenuItem.FramedImage imageUrl={item.image} />
          <MenuItem.PriceDisplay
            use={<Heading size="xSmall" />}
            price={`${currency.symbol} 
            ${tokenValueFormat(amount)}`}
            fiatAmount={`${t(
              'views.FUND_WITH_SMART_CHECKOUT.currency.usdEstimate',
            )}${usdPurchaseAmount}`}
          />
          <MenuItem.Label>
            {item?.name}
            {item.qty > 1 ? ` x${item.qty}` : null}
          </MenuItem.Label>
          <MenuItem.Caption>{collectionName}</MenuItem.Caption>
        </MenuItem>
      ))}
    </>
  );
}

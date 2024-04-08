import { Heading, MenuItem } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaleContext } from '../../context/SaleContextProvider';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../../lib/utils';
import { CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';

type PurchaseMenuItemProps = {
  fundingRoute: FundingRoute;
  collectionName: string;
};

export function PurchaseMenuItem({ fundingRoute, collectionName }: PurchaseMenuItemProps) {
  const { t } = useTranslation();
  const { items } = useSaleContext();
  const firstItem = items[0];
  const firstFundingStep = fundingRoute.steps[0];
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [usdPurchaseAmount, setUsdPurchaseAmount] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!cryptoFiatState.conversions) {
      return;
    }
    try {
      setUsdPurchaseAmount(
        calculateCryptoToFiat(
          firstFundingStep.fundingItem.fundsRequired.formattedAmount,
          firstFundingStep.fundingItem.token.symbol,
          cryptoFiatState.conversions,
        ),
      );
    } catch {
      console.log('🚀 ~ setUsdPurchaseAmount:'); // eslint-disable-line
      setUsdPurchaseAmount(undefined);
    }
  }, [cryptoFiatState, fundingRoute]);

  return (
    <MenuItem
      emphasized
      testId="funding-route-purchase-item"
      size="medium"
      key={firstItem?.name}
    >
      <MenuItem.FramedImage
        imageUrl={firstItem?.image}
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        price={`${firstFundingStep?.fundingItem.token.symbol} 
          ${tokenValueFormat(firstFundingStep.fundingItem.fundsRequired.formattedAmount)}`}
        fiatAmount={`${t('views.FUND_WITH_SMART_CHECKOUT.currency.usdEstimate')}${usdPurchaseAmount}`}
      />
      <MenuItem.Label>
        {firstItem?.name}
        {firstItem?.qty > 1 ? ` x${firstItem.qty}` : null}
      </MenuItem.Label>
      <MenuItem.Caption>
        {collectionName}
      </MenuItem.Caption>
    </MenuItem>
  );
}

import {
  Button, Heading, HorizontalMenu, MenuItem,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { getChainNameById } from 'lib/chains';
import { useTranslation } from 'react-i18next';
import { CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../../lib/utils';
import { useSaleContext } from '../../context/SaleContextProvider';

export interface BalanceItemProps {
  onClick: () => void;
  fundingRoute: FundingRoute;
  toggleVisible?: boolean;
  selected?: boolean;
}
export function BalanceItem({
  onClick,
  fundingRoute,
  toggleVisible,
  selected,
}: BalanceItemProps) {
  const { t } = useTranslation();
  const firstFundingStep = fundingRoute.steps[0];

  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const { isPassportWallet } = useSaleContext();

  const [feesUsd, setFeesUsd] = useState<string | undefined>(undefined);
  const [usdBalance, setUsdBalance] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!cryptoFiatState.conversions) {
      return;
    }
    try {
      setUsdBalance(
        calculateCryptoToFiat(
          firstFundingStep.fundingItem.userBalance.formattedBalance,
          firstFundingStep.fundingItem.token.symbol,
          cryptoFiatState.conversions,
        ),
      );
    } catch {
      setFeesUsd(undefined);
      setUsdBalance(undefined);
    }
  }, [cryptoFiatState, fundingRoute]);

  const networkLabel = () => (
    <HorizontalMenu.Button
      rc={<a />}
      sx={{
        pointerEvents: 'none',
        cursor: 'default',
        height: '100%',
        marginLeft: 'base.spacing.x2',
        fontSize: 'base.text.body.xxSmall.regular.fontSize',
        fontWeight: 'base.text.body.xxSmall.regular.fontWeight',
        color: 'base.color.brand.4',
        paddingLeft: 'base.spacing.x2',
        paddingRight: 'base.spacing.x2',
      }}
      size="small"
    >
      <Button.Icon icon="" />
      {getChainNameById(firstFundingStep.chainId)}
    </HorizontalMenu.Button>
  );

  return (
    <MenuItem
      emphasized
      testId="funding-route-menu-item"
      onClick={onClick}
      selected={selected}
    >
      {toggleVisible && <MenuItem.IntentIcon icon="ChevronExpand" />}
      <MenuItem.FramedIcon icon="Coins" circularFrame />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={`${t(
          'views.FUND_WITH_SMART_CHECKOUT.currency.usdEstimate',
        )}${usdBalance}`}
        price={tokenValueFormat(
          firstFundingStep.fundingItem.userBalance.formattedBalance,
        )}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {firstFundingStep.fundingItem.token.symbol}
        {isPassportWallet ? null : networkLabel()}
      </MenuItem.Label>
      <MenuItem.Caption>
        Fees ≈ USD $
        {feesUsd}
      </MenuItem.Caption>
    </MenuItem>
  );
}

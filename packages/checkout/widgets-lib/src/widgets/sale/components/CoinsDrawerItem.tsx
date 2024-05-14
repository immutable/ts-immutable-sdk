import {
  Box,
  Heading, MenuItem, MenuItemSize, prettyFormatNumber,
} from '@biom3/react';
import { TransactionRequirement } from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  getDefaultTokenImage,
  tokenValueFormat,
} from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react';

import { useSaleContext } from '../context/SaleContextProvider';
import { FundingBalance } from '../types';
import { getFundingBalanceTotalFees } from '../functions/fundingBalanceFees';

export interface CoinDrawerItemProps<
  RC extends ReactElement | undefined = undefined,
> {
  rc?: RC;
  size: MenuItemSize;
  balance: FundingBalance;
  conversions: Map<string, number>;
  selected: boolean;
  transactionRequirement?: TransactionRequirement;
  onClick: () => void;
}

export function CoinsDrawerItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  balance,
  conversions,
  selected,
  onClick,
  size,
}: CoinDrawerItemProps<RC>) {
  const { t } = useTranslation();
  const {
    environment,
    config: { theme },
  } = useSaleContext();

  const { token, userBalance } = balance.fundingItem;

  const fiatAmount = calculateCryptoToFiat(
    userBalance.formattedBalance,
    token.symbol,
    conversions,
    '',
  );
  const fees = Object.entries(getFundingBalanceTotalFees(balance));

  const menuProps = {
    onClick,
    selected,
  };

  return (
    <MenuItem
      rc={rc}
      sx={{ mb: 'base.spacing.x1' }}
      size={size}
      emphasized
      {...menuProps}
    >
      <MenuItem.FramedImage
        circularFrame
        alt={token.name}
        imageUrl={token.icon}
        defaultImageUrl={getDefaultTokenImage(environment, theme)}
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={
          fiatAmount
            ? t('views.ORDER_SUMMARY.currency.fiat', { amount: fiatAmount })
            : undefined
        }
        price={tokenValueFormat(userBalance.formattedBalance)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {token.symbol}
      </MenuItem.Label>
      <MenuItem.Caption>
        {fees.length > 0
          && fees.map(([key, { token: tokenInfo, formattedAmount }]) => (
            <Box key={key} rc={<span />} sx={{ d: 'block' }}>
              {t('views.ORDER_SUMMARY.coinsDrawer.fee', {
                symbol: tokenInfo?.symbol || key,
                amount: prettyFormatNumber(tokenValueFormat(formattedAmount)),
              })}
            </Box>
          ))}
      </MenuItem.Caption>
    </MenuItem>
  );
}

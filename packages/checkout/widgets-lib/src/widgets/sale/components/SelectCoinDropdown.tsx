import {
  Button, Heading, MenuItem, ShimmerCircle, Stack,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { FundingBalance } from '../types';

type SelectCoinDropdownProps = {
  balance: FundingBalance;
  conversions: Map<string, number>;
  canOpen: boolean;
  onClick: () => void;
  onProceed: (balance: FundingBalance) => void;
  loading?: boolean;
  priceDisplay?: boolean;
};

export function SelectCoinDropdown({
  balance,
  conversions,
  canOpen,
  onClick,
  onProceed,
  loading,
  priceDisplay,
}: SelectCoinDropdownProps) {
  const { t } = useTranslation();

  const { token, userBalance, fundsRequired } = balance.fundingItem;

  const fiatAmount = calculateCryptoToFiat(
    userBalance.formattedBalance,
    token.symbol,
    conversions,
  );

  return (
    <Stack
      sx={{
        w: '100%',
        bradtl: 'base.borderRadius.x6',
        bradtr: 'base.borderRadius.x6',
        px: 'base.spacing.x4',
        pb: 'base.spacing.x6',
        bg: 'base.color.neutral.800',
        border: '0px solid transparent',
        borderTopWidth: 'base.border.size.100',
        borderTopColor: 'base.color.translucent.emphasis.400',
      }}
    >
      <MenuItem size="medium">
        <MenuItem.FramedImage
          imageUrl={token.icon}
          alt={token.name}
          circularFrame
        />
        <MenuItem.Label>
          {t('views.ORDER_SUMMARY.orderReview.payWith', {
            symbol: token.symbol,
          })}
        </MenuItem.Label>
        <MenuItem.Caption rc={<Heading size="xSmall" />}>
          {t('views.ORDER_SUMMARY.orderReview.balance', {
            amount: tokenValueFormat(userBalance.formattedBalance),
          })}
        </MenuItem.Caption>
        {priceDisplay && (
          <MenuItem.PriceDisplay
            use={<Heading size="xSmall" />}
            fiatAmount={t('views.ORDER_SUMMARY.currency.fiat', {
              amount: fiatAmount,
            })}
            price={t('views.ORDER_SUMMARY.currency.price', {
              symbol: token.symbol,
              amount: tokenValueFormat(fundsRequired.formattedAmount),
            })}
          />
        )}
        {canOpen && (
          <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClick} />
        )}
        {!canOpen && loading && <ShimmerCircle radius="base.icon.size.400" />}
      </MenuItem>
      <Button size="large" onClick={() => onProceed(balance)}>
        {t('views.ORDER_SUMMARY.orderReview.continue')}
      </Button>
    </Stack>
  );
}

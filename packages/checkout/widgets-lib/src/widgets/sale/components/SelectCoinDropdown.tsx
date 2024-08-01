import {
  Button,
  MenuItem,
  ShimmerCircle,
  Stack,
  prettyFormatNumber,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  calculateCryptoToFiat, tokenValueFormat,
} from '../../../lib/utils';
import { TokenImage } from '../../../components/TokenImage/TokenImage';
import { FundingBalance } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';

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
  const {
    environment,
    config: { theme },
  } = useSaleContext();

  const { token, userBalance, fundsRequired } = balance.fundingItem;

  const fiatAmount = calculateCryptoToFiat(
    fundsRequired.formattedAmount,
    token.symbol,
    conversions,
    '',
  );

  const balanceFiatAmount = calculateCryptoToFiat(
    userBalance.formattedBalance,
    token.symbol,
    conversions,
    '',
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
          circularFrame
          use={(
            <TokenImage
              environment={environment}
              theme={theme}
              name={token.name}
              src={token.icon}
            />
          )}
        />
        <MenuItem.Label>
          {t(`views.ORDER_SUMMARY.orderReview.payWith.${balance.type}`, {
            symbol: token.symbol,
          })}
        </MenuItem.Label>
        <MenuItem.Caption>
          {`${t('views.ORDER_SUMMARY.orderReview.balance', {
            amount: prettyFormatNumber(
              tokenValueFormat(userBalance.formattedBalance),
            ),
          })} ${
            balanceFiatAmount
              ? t('views.ORDER_SUMMARY.currency.fiat', {
                amount: prettyFormatNumber(
                  tokenValueFormat(balanceFiatAmount),
                ),
              })
              : ''
          }`}
        </MenuItem.Caption>
        {priceDisplay && (
          <MenuItem.PriceDisplay
            fiatAmount={
              fiatAmount
                ? t('views.ORDER_SUMMARY.currency.fiat', { amount: fiatAmount })
                : undefined
            }
            price={tokenValueFormat(fundsRequired.formattedAmount)}
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

import {
  Drawer, Box, Divider, MenuItem,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { formatZeroAmount, tokenValueFormat } from '../../lib/utils';
import { feeItemContainerStyles, feeItemLoadingStyles, feesBreakdownContentStyles } from './FeesBreakdownStyles';
import { FeeItem } from './FeeItem';
import { FooterLogo } from '../Footer/FooterLogo';
import { FormattedFee } from '../../widgets/swap/functions/swapFees';

type FeesBreakdownProps = {
  onCloseDrawer?: () => void;
  fees: FormattedFee[];
  children?: any;
  visible?: boolean;
  totalFiatAmount?: string;
  totalAmount?: string;
  tokenSymbol: string;
  loading?: boolean;
};

export function FeesBreakdown({
  fees,
  children,
  visible,
  onCloseDrawer,
  totalFiatAmount,
  totalAmount,
  tokenSymbol,
  loading = false,
}: FeesBreakdownProps) {
  const { t } = useTranslation();
  return (
    <Drawer
      headerBarTitle={t('drawers.feesBreakdown.heading')}
      size="threeQuarter"
      onCloseDrawer={onCloseDrawer}
      visible={visible}
    >
      <Drawer.Target>
        {children}
      </Drawer.Target>
      <Drawer.Content testId="fees-breakdown-content" sx={feesBreakdownContentStyles}>
        <Box sx={feeItemContainerStyles}>
          {
            loading && (
              <Box sx={feeItemLoadingStyles}>
                <MenuItem shimmer emphasized testId="balance-item-shimmer--1" />
                <MenuItem shimmer emphasized testId="balance-item-shimmer--2" />
              </Box>
            )
          }
          {
            !loading && fees.map(({
              label,
              amount,
              fiatAmount,
              prefix,
              token,
            }) => (
              <FeeItem
                key={label}
                label={label}
                amount={amount}
                fiatAmount={fiatAmount}
                tokenSymbol={token.symbol ?? ''}
                prefix={prefix}
              />
            ))
          }
          {totalAmount && (
            <>
              <Divider size="xSmall" />
              <FeeItem
                key={t('drawers.feesBreakdown.total')}
                label={t('drawers.feesBreakdown.total')}
                amount={tokenValueFormat(totalAmount)}
                fiatAmount={totalFiatAmount
                  ? `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${totalFiatAmount}`
                  : formatZeroAmount('0')}
                tokenSymbol={tokenSymbol}
                boldLabel
              />
            </>
          )}
        </Box>
        <FooterLogo />
      </Drawer.Content>
    </Drawer>
  );
}

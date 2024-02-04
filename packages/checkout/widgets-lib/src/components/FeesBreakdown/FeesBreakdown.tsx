import {
  Drawer, Box, Divider,
} from '@biom3/react';
import { formatZeroAmount, tokenValueFormat } from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { feeItemContainerStyles, feesBreakdownContentStyles } from './FeesBreakdownStyles';
import { FeeItem } from './FeeItem';
import { FooterLogo } from '../Footer/FooterLogo';

type Fee = {
  label: string;
  amount: string;
  fiatAmount: string;
};

type FeesBreakdownProps = {
  onCloseDrawer?: () => void;
  fees: Fee[];
  children?: any;
  visible?: boolean;
  totalFiatAmount?: string;
  totalAmount?: string;
  tokenSymbol: string;
};

export function FeesBreakdown({
  fees,
  children,
  visible,
  onCloseDrawer,
  totalFiatAmount,
  totalAmount,
  tokenSymbol,
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
            fees.map(({ label, amount, fiatAmount }) => (
              <FeeItem
                key={label}
                label={label}
                amount={amount}
                fiatAmount={fiatAmount}
                tokenSymbol={tokenSymbol}
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
                  ? `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${totalFiatAmount}`
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

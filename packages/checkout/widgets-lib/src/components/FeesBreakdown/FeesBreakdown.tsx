import {
  Drawer, Box, Divider,
} from '@biom3/react';
import { tokenValueFormat } from 'lib/utils';
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
  totalFiatAmount: string;
  totalAmount: string;
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
          <FeeItem
            key={t('drawers.feesBreakdown.total')}
            label={t('drawers.feesBreakdown.total')}
            amount={tokenValueFormat(totalAmount)}
            fiatAmount={totalFiatAmount}
            tokenSymbol={tokenSymbol}
            boldLabel
          />
          <Divider size="xSmall" />
          {
            fees.map(({ label, amount, fiatAmount }) => (
              <FeeItem
                key={label}
                label={label}
                amount={tokenValueFormat(amount)}
                fiatAmount={fiatAmount}
                tokenSymbol={tokenSymbol}
              />
            ))
          }
        </Box>
        <FooterLogo />
      </Drawer.Content>
    </Drawer>
  );
}

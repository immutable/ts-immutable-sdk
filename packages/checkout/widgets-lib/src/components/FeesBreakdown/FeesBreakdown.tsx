import {
  Drawer, Box, Divider,
} from '@biom3/react';
import { tokenValueFormat } from 'lib/utils';
import { feeItemContainerStyles, feesBreakdownContentStyles } from './FeesBreakdownStyles';
import { FeeItem } from './FeeItem';
import { text } from '../../resources/text/textConfig';
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
  return (
    <Drawer
      headerBarTitle={text.drawers.feesBreakdown.heading}
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
            key={text.drawers.feesBreakdown.total}
            label={text.drawers.feesBreakdown.total}
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

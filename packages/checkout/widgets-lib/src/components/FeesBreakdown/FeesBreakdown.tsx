import {
  BottomSheet, Box, Divider,
} from '@biom3/react';
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
  onCloseBottomSheet?: () => void;
  fees: Fee[];
  children?: any;
  visible?: boolean;
  totalFiatAmount: string;
  totalAmount: string;
};

export function FeesBreakdown({
  fees, children, onCloseBottomSheet, visible, totalFiatAmount, totalAmount,
}: FeesBreakdownProps) {
  return (
    <BottomSheet
      headerBarTitle={text.drawers.feesBreakdown.heading}
      size="threeQuarter"
      onCloseBottomSheet={onCloseBottomSheet}
      visible={visible}
    >
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content testId="fees-breakdown-content" sx={feesBreakdownContentStyles}>
        <Box sx={feeItemContainerStyles}>
          <FeeItem
            key={text.drawers.feesBreakdown.total}
            label={text.drawers.feesBreakdown.total}
            amount={totalAmount}
            fiatAmount={totalFiatAmount}
            boldLabel
          />
          <Divider size="xSmall" />
          {
              fees.map(({ label, amount, fiatAmount }) => (
                <FeeItem key={label} label={label} amount={amount} fiatAmount={fiatAmount} />
              ))
            }
        </Box>
        <FooterLogo />
      </BottomSheet.Content>
    </BottomSheet>
  );
}

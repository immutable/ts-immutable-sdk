import {
  BottomSheet, Box, Divider,
} from '@biom3/react';
import { feeItemContainerStyles } from './styles';
import { FeeItem } from './FeeItem';

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
      headerBarTitle="Fees"
      size="threeQuarter"
      onCloseBottomSheet={onCloseBottomSheet}
      visible={visible}
    >
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={feeItemContainerStyles}>
          <FeeItem label="Fees total" amount={totalAmount} fiatAmount={totalFiatAmount} boldLabel />
          {
            fees.map(({ label, amount, fiatAmount }) => (
              <>
                <Divider size="xSmall" />
                <FeeItem label={label} amount={amount} fiatAmount={fiatAmount} />
              </>
            ))
          }
        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}

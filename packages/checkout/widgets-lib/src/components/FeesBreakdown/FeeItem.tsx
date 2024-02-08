import { Body, Box, PriceDisplay } from '@biom3/react';
import { feeItemStyles, feeItemLabelStyles, feeItemPriceDisplayStyles } from './FeesBreakdownStyles';

export interface FeeItemProps {
  boldLabel?: boolean;
  label: string;
  amount: string;
  fiatAmount: string;
  tokenSymbol: string;
  prefix?: string;
}

export function FeeItem({
  boldLabel,
  label,
  amount,
  fiatAmount,
  tokenSymbol,
  prefix = '',
}: FeeItemProps) {
  const key = label.toLowerCase().replace(' ', '-');

  return (
    <Box
      sx={feeItemStyles}
      testId={`fee-item-${key}`}
    >
      <Body sx={feeItemLabelStyles(boldLabel)}>
        {label}
      </Body>
      <PriceDisplay
        testId={key}
        sx={feeItemPriceDisplayStyles}
        price={`${prefix}${tokenSymbol} ${amount}`}
        fiatAmount={fiatAmount}
      />
    </Box>
  );
}

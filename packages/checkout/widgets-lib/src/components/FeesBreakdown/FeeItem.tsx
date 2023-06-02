import { Body, Box, PriceDisplay } from '@biom3/react';
import { feeItemStyles, feeItemLabelStyles, feeItemPriceDisplayStyles } from './styles';

export interface FeeItemProps {
  boldLabel?: boolean;
  label: string;
  amount: string;
  fiatAmount: string;
}

export function FeeItem({
  boldLabel,
  label,
  amount,
  fiatAmount,
}: FeeItemProps) {
  return (
    <Box sx={feeItemStyles}>
      <Body sx={feeItemLabelStyles(boldLabel)}>
        {label}
      </Body>
      <PriceDisplay
        sx={feeItemPriceDisplayStyles}
        price={amount}
        fiatAmount={fiatAmount}
      />
    </Box>
  );
}

import { Body, Box } from '@biom3/react';
import { FeeBoxStyles, FeeContainerStyles } from './FeeStyles';

export interface FeeProps {
  fees: string;
  tokenSymbol: string;
  fiatPrice: string;
}

export function Fees(feeProps: FeeProps) {
  const { fees, fiatPrice, tokenSymbol } = feeProps;

  return (
    <Box sx={FeeContainerStyles}>
      <Body size="medium" weight="regular">
        Fees total
      </Body>
      <Box sx={FeeBoxStyles}>
        <Body size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          ≈
          {' '}
          {tokenSymbol.toUpperCase()}
          {' '}
          {fees}
        </Body>
        <Body size="xSmall" weight="regular" sx={{ textAlign: 'left' }}>
          Approx USD $
          {fiatPrice}
        </Body>
      </Box>
    </Box>
  );
}

import { Body, Box, ButtCon } from '@biom3/react';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';

export interface FeeProps {
  fees: string;
  tokenSymbol: string;
  fiatPrice: string;
}

export function Fees(feeProps: FeeProps) {
  const { fees, fiatPrice, tokenSymbol } = feeProps;

  return (
    <Box sx={feeContainerStyles}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 'base.spacing.x2',
        }}
      >
        <ButtCon
          size="small"
          variant="tertiary"
          icon="ChevronExpand"
          iconVariant="bold"
        />
        <Body size="medium" weight="regular">
          Fees total
        </Body>
      </Box>
      <Box sx={feeBoxStyles}>
        <Body size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          ≈
          {' '}
          {tokenSymbol.toUpperCase()}
          {' '}
          {fees}
        </Body>
        <Body
          size="xSmall"
          weight="regular"
          sx={{ color: 'base.color.text.secondary' }}
        >
          Approx USD $
          {fiatPrice}
        </Body>
      </Box>
    </Box>
  );
}

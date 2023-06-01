import { Body, Box, ButtCon } from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';
import { formatZeroAmount, tokenValueFormat } from '../../lib/utils';

interface FeesProps {
  title: string;
  fiatPricePrefix: string;
  gasFeeValue: string;
  gasFeeToken: TokenInfo | null;
  gasFeeFiatValue: string;
}

export function Fees({
  title, fiatPricePrefix, gasFeeValue, gasFeeToken, gasFeeFiatValue,
}: FeesProps) {
  if (!gasFeeValue) return <Box />;
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
          {title}
        </Body>
      </Box>
      <Box sx={feeBoxStyles}>
        <Body testId="fee_description_gas" size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          {`≈ ${gasFeeToken?.symbol} ${formatZeroAmount(tokenValueFormat(gasFeeValue))}`}
        </Body>
        <Body
          testId="fee_description_gas_fiat"
          size="small"
          weight="regular"
          sx={{ color: 'base.color.text.secondary', textAlign: 'right' }}
        >
          {`${fiatPricePrefix} $${formatZeroAmount(gasFeeFiatValue, true)}`}
        </Body>
      </Box>
    </Box>
  );
}

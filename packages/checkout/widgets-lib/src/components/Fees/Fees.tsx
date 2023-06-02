import { Body, Box, ButtCon } from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';
import { formatZeroAmount, tokenValueFormat } from '../../lib/utils';
import { FeesBreakdown } from '../FeesBreakdown/FeesBreakdown';

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

  const formattedGasValue = formatZeroAmount(tokenValueFormat(gasFeeValue));
  const gasTokenSymbol = gasFeeToken?.symbol;
  const formattedTotalValue = gasTokenSymbol
    ? `${gasTokenSymbol} ${formattedGasValue}`
    : formattedGasValue;

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
        <FeesBreakdown
          totalFiatAmount={`${fiatPricePrefix} $${gasFeeFiatValue}`}
          totalAmount={formattedTotalValue}
          fees={[
            {
              label: 'Gas fee',
              fiatAmount: `${fiatPricePrefix} $${gasFeeFiatValue}`,
              amount: formattedTotalValue,
            },
          ]}
        >
          <ButtCon
            size="small"
            variant="tertiary"
            icon="ChevronExpand"
            iconVariant="bold"
          />
        </FeesBreakdown>
        <Body size="medium" weight="regular">
          {title}
        </Body>
      </Box>
      <Box sx={feeBoxStyles}>
        <Body testId="fee_description_gas" size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          {`≈ ${gasTokenSymbol} ${formatZeroAmount(tokenValueFormat(gasFeeValue))}`}
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

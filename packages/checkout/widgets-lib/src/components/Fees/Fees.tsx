import { Body, Box, ButtCon } from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';
import { formatZeroAmount, tokenValueFormat } from '../../lib/utils';
import { FeesBreakdown } from '../FeesBreakdown/FeesBreakdown';

interface FeesProps {
  title: string;
  fiatPricePrefix: string;
  gasFeeValue: string;
  gasFeeToken?: TokenInfo;
  gasFeeFiatValue: string;
}

export function Fees({
  title, fiatPricePrefix, gasFeeValue, gasFeeToken, gasFeeFiatValue,
}: FeesProps) {
  const { t } = useTranslation();
  const { track } = useAnalytics();

  if (!gasFeeValue) return <Box />;

  const formattedGasValue = formatZeroAmount(tokenValueFormat(gasFeeValue));
  const gasTokenSymbol = gasFeeToken?.symbol;

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
          totalAmount={formattedGasValue}
          tokenSymbol={gasFeeToken?.symbol ?? ''}
          fees={[
            {
              label: t('drawers.feesBreakdown.fees.gas.label'),
              fiatAmount: `${fiatPricePrefix} $${gasFeeFiatValue}`,
              amount: formattedGasValue,
            },
          ]}
        >
          <ButtCon
            size="small"
            variant="tertiary"
            icon="ChevronExpand"
            iconVariant="bold"
            onClick={() => {
              track({
                userJourney: UserJourney.SWAP,
                screen: 'SwapCoins',
                control: 'ViewFees',
                controlType: 'Button',
              });
            }}
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

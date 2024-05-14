import {
  Accordion,
  Body,
  Box,
  PriceDisplay, ShimmerBox,
  SxProps,
} from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { formatZeroAmount, tokenValueFormat } from '../../lib/utils';
import { FeesBreakdown } from '../FeesBreakdown/FeesBreakdown';
import { gasAmountAccordionStyles, gasAmountHeadingStyles } from './FeeStyles';
import { FormattedFee } from '../../widgets/swap/functions/swapFees';

interface FeesProps {
  gasFeeValue: string;
  gasFeeToken?: TokenInfo;
  gasFeeFiatValue: string;
  fees: FormattedFee[];
  onFeesClick?: () => void;
  loading?: boolean;
  sx?: SxProps;
}

export function Fees({
  gasFeeValue, gasFeeToken, gasFeeFiatValue, fees, onFeesClick, loading, sx,
}: FeesProps) {
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const { t } = useTranslation();
  if (!gasFeeValue && !loading) return null;

  const gasFee = formatZeroAmount(tokenValueFormat(gasFeeValue));
  const gasTokenSymbol = gasFeeToken?.symbol;

  const viewFees = () => {
    setShowFeeBreakdown(true);
    onFeesClick?.();
  };

  return (
    <>
      <Accordion
        targetClickOveride={viewFees}
        sx={{ ...gasAmountAccordionStyles, paddingBottom: 'base.spacing.x2', ...sx }}
      >
        <Accordion.TargetLeftSlot>
          <Body size="medium" sx={gasAmountHeadingStyles}>
            {t('drawers.feesBreakdown.heading')}
          </Body>
        </Accordion.TargetLeftSlot>
        <Accordion.TargetRightSlot>
          {loading && (
            <Box sx={{ width: '218px', position: 'relative' }}>
              <Box
                sx={{
                  display: 'block',
                  position: 'absolute',
                  top: '-15px',
                  width: '100%',
                  height: '68px',
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  WebkitMaskPosition: 'right center',
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  WebkitMaskRepeat: 'no-repeat',
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  WebkitMaskSize: 'contain',
                  // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
                  WebkitMaskImage: 'url(\'data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" width="196" height="96"><path d="M182.85 55.2Q181.65 54 180 54h-56q-1.7 0-2.85 1.2Q120 56.35 120 58v4q0 1.7 1.15 2.85Q122.3 66 124 66h56q1.65 0 2.85-1.15Q184 63.7 184 62v-4q0-1.65-1.15-2.8m0-22Q181.65 32 180 32H68q-1.7 0-2.85 1.2Q64 34.35 64 36v8q0 1.7 1.15 2.85Q66.3 48 68 48h112q1.65 0 2.85-1.15Q184 45.7 184 44v-8q0-1.65-1.15-2.8Z" id="a"/></svg>\')',
                }}
                rc={<span />}
              >
                <ShimmerBox
                  rc={<span />}
                />
              </Box>
            </Box>
          )}
          {!loading && (
            <PriceDisplay
              testId="fees-gas-fee__priceDisplay"
              fiatAmount={`≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${gasFeeFiatValue}`}
              price={`≈ ${gasTokenSymbol} ${formatZeroAmount(tokenValueFormat(gasFee))}`}
            />
          )}
        </Accordion.TargetRightSlot>
      </Accordion>
      <FeesBreakdown
        tokenSymbol={gasTokenSymbol ?? ''}
        fees={fees}
        visible={showFeeBreakdown}
        loading={loading}
        onCloseDrawer={() => setShowFeeBreakdown(false)}
      />
    </>
  );
}

import {
  Accordion,
  Body,
  Box,
  PriceDisplay,
} from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { formatZeroAmount, tokenValueFormat } from '../../lib/utils';
import { FeesBreakdown } from '../FeesBreakdown/FeesBreakdown';
import { gasAmountAccordionStyles, gasAmountHeadingStyles } from './FeeStyles';

interface FeesProps {
  gasFeeValue: string;
  gasFeeToken?: TokenInfo;
  gasFeeFiatValue: string;
  fees: {
    fiatAmount: string;
    amount: string;
    label: string;
  }[];
  onFeesClick?: () => void;
  sx?: any;
}

export function Fees({
  gasFeeValue, gasFeeToken, gasFeeFiatValue, fees, onFeesClick, sx,
}: FeesProps) {
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const { t } = useTranslation();

  if (!gasFeeValue) return <Box sx={...sx} />;

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
          <PriceDisplay
            testId="fees-gas-fee__priceDisplay"
            fiatAmount={`~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${gasFeeFiatValue}`}
            price={`~ ${gasTokenSymbol} ${formatZeroAmount(tokenValueFormat(gasFee))}`}
          />
        </Accordion.TargetRightSlot>
      </Accordion>
      <FeesBreakdown
        totalFiatAmount={gasFeeFiatValue}
        totalAmount={gasFee}
        tokenSymbol={gasTokenSymbol ?? ''}
        fees={fees}
        visible={showFeeBreakdown}
        onCloseDrawer={() => setShowFeeBreakdown(false)}
      />
    </>
    // <Box sx={feeContainerStyles}>
    //   <Box
    //     sx={{
    //       display: 'flex',
    //       flexDirection: 'row',
    //       alignItems: 'center',
    //       gap: 'base.spacing.x2',
    //     }}
    //   >
    //     <FeesBreakdown
    //       totalFiatAmount={`${fiatPricePrefix} $${gasFeeFiatValue}`}
    //       totalAmount={formattedGasValue}
    //       tokenSymbol={gasFeeToken?.symbol ?? ''}
    //       fees={[
    //         {
    //           label: t('drawers.feesBreakdown.fees.gas.label'),
    //           fiatAmount: `${fiatPricePrefix} $${gasFeeFiatValue}`,
    //           amount: formattedGasValue,
    //         },
    //       ]}
    //     >
    //       <ButtCon
    //         size="small"
    //         variant="tertiary"
    //         icon="ChevronExpand"
    //         iconVariant="bold"
    //         onClick={() => {
    //           track({
    //             userJourney: UserJourney.SWAP,
    //             screen: 'SwapCoins',
    //             control: 'ViewFees',
    //             controlType: 'Button',
    //           });
    //         }}
    //       />
    //     </FeesBreakdown>
    //     <Body size="medium" weight="regular">
    //       {title}
    //     </Body>
    //   </Box>
    //   <Box sx={feeBoxStyles}>
    //     <Body testId="fee_description_gas" size="medium" weight="regular" sx={{ textAlign: 'right' }}>
    //       {`≈ ${gasTokenSymbol} ${formatZeroAmount(tokenValueFormat(gasFeeValue))}`}
    //     </Body>
    //     <Body
    //       testId="fee_description_gas_fiat"
    //       size="small"
    //       weight="regular"
    //       sx={{ color: 'base.color.text.secondary', textAlign: 'right' }}
    //     >
    //       {`${fiatPricePrefix} $${formatZeroAmount(gasFeeFiatValue, true)}`}
    //     </Body>
    //   </Box>
    // </Box>
  );
}

import { Body, Box, ButtCon } from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';
import { text } from '../../../resources/text/textConfig';
import { formatZeroAmount, tokenValueFormat } from '../../../lib/utils';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';

interface FeesProps {
  gasFeeValue: string;
  gasFeeToken: TokenInfo | null;
  gasFeeFiatValue: string;
}

export function Fees({ gasFeeValue, gasFeeToken, gasFeeFiatValue }: FeesProps) {
  const staticText = text.views[BridgeWidgetViews.BRIDGE];

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
          {staticText.fees.title}
        </Body>
      </Box>
      <Box sx={feeBoxStyles}>
        <Body testId="fee_description_gas" size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          ≈
          {' '}
          {gasFeeToken?.symbol}
          {' '}
          {formatZeroAmount(tokenValueFormat(gasFeeValue))}
        </Body>
        <Body
          testId="fee_description_gas_fiat"
          size="small"
          weight="regular"
          sx={{ color: 'base.color.text.secondary', textAlign: 'right' }}
        >
          {staticText.content.fiatPricePrefix}
          {' '}
          $
          {formatZeroAmount(gasFeeFiatValue, true)}
        </Body>
      </Box>
    </Box>
  );
}

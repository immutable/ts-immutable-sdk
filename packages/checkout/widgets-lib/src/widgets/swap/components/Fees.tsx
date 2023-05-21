import { Body, Box, ButtCon } from '@biom3/react';
import { useContext } from 'react';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapFormContext } from '../context/swap-form-context/SwapFormContext';
import { tokenValueFormat } from '../../../lib/utils';

export function Fees() {
  const staticText = text.views[SwapWidgetViews.SWAP];

  const { swapFormState: { gasFeeValue, gasFeeFiatValue } } = useContext(SwapFormContext);

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
        <Body size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          {staticText.content.gasFeePrefix}
          {' '}
          {tokenValueFormat(gasFeeValue)}
        </Body>
        <Body
          size="small"
          weight="regular"
          sx={{ color: 'base.color.text.secondary', textAlign: 'right' }}
        >
          {staticText.content.fiatPricePrefix}
          {' '}
          {gasFeeFiatValue}
        </Body>
      </Box>
    </Box>
  );
}

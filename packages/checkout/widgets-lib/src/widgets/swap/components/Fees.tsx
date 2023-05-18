import { Body, Box, ButtCon } from '@biom3/react';
import { feeBoxStyles, feeContainerStyles } from './FeeStyles';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';

export interface FeeProps {
  fees: string;
  tokenSymbol: string;
  fiatPrice: string;
}

export function Fees(feeProps: FeeProps) {
  const { fees, fiatPrice, tokenSymbol } = feeProps;
  const {
    fees: { title },
    content,
  } = text.views[SwapWidgetViews.SWAP];

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
        <Body size="medium" weight="regular" sx={{ textAlign: 'right' }}>
          {`≈ ${tokenSymbol.toUpperCase()} ${fees}`}
        </Body>
        <Body
          size="xSmall"
          weight="regular"
          sx={{ color: 'base.color.text.secondary' }}
        >
          {`${content.fiatPricePrefix} ${fiatPrice}`}
        </Body>
      </Box>
    </Box>
  );
}

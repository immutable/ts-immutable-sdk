import { SxProps } from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { Fees } from 'components/Fees/Fees';
import { FormattedFee } from 'widgets/swap/functions/swapFees';

export type FeesDisplay = {
  token: TokenInfo | undefined;
  amount: string;
  fiatAmount: string;
  formattedFees: FormattedFee[];
};

export type OrderFeesProps = {
  swapFees: FeesDisplay;
  onFeesClick?: () => void;
  sx?: SxProps;
};
export function OrderFees({ sx, swapFees, onFeesClick }: OrderFeesProps) {
  return (
    <Fees
      gasFeeFiatValue={swapFees.fiatAmount}
      gasFeeToken={swapFees.token}
      gasFeeValue={swapFees.amount}
      fees={swapFees.formattedFees}
      onFeesClick={onFeesClick}
      sx={sx}
      loading={false}
    />
  );
}

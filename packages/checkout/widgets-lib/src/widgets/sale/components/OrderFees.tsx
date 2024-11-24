import { SxProps } from '@biom3/react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { Fees } from '../../../components/Fees/Fees';
import { FormattedFee } from '../../swap/functions/swapFees';

export type FeesDisplay = {
  token: TokenInfo | undefined;
  amount: string;
  fiatAmount: string;
  formattedFees: FormattedFee[];
};

export type OrderFeesProps = {
  fees: FeesDisplay;
  onFeesClick?: () => void;
  sx?: SxProps;
};
export function OrderFees({ sx, fees, onFeesClick }: OrderFeesProps) {
  return (
    <Fees
      gasFeeFiatValue={fees.fiatAmount}
      gasFeeToken={fees.token}
      gasFeeValue={fees.amount}
      fees={fees.formattedFees}
      onFeesClick={onFeesClick}
      sx={sx}
      loading={false}
    />
  );
}

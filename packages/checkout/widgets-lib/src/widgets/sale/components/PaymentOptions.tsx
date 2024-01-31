import { Box } from '@biom3/react';

import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { PaymentOption } from './PaymentOption';

const defaultPaymentOptions: SalePaymentTypes[] = [
  SalePaymentTypes.FIAT,
  SalePaymentTypes.CRYPTO,
];

export interface PaymentOptionsProps {
  onClick: (type: SalePaymentTypes) => void;
  disabledOptions?: SalePaymentTypes[];
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const { disabledOptions = [], onClick } = props;

  return (
    <Box
      testId="payment-options-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {defaultPaymentOptions.map((type) => (
        <PaymentOption
          disabled={disabledOptions.includes(type)}
          onClick={onClick}
          type={type}
          key={type}
        />
      ))}
    </Box>
  );
}

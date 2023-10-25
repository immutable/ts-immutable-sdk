import { Box } from '@biom3/react';

import { PaymentOption } from './PaymentOption';

import { PaymentTypes } from '../types';

const defaultPaymentOptions: PaymentTypes[] = [
  PaymentTypes.FIAT,
  PaymentTypes.CRYPTO,
];

export interface PaymentOptionsProps {
  onClick: (type: PaymentTypes) => void;
  disabledOptions?: PaymentTypes[];
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

import { Box } from '@biom3/react';

import { PaymentOption } from './PaymentOption';

import { PaymentTypes } from '../types';

const defaultPaymentOptions: PaymentTypes[] = [
  PaymentTypes.CRYPTO,
  PaymentTypes.FIAT,
];

export interface PaymentOptionsProps {
  onClick: (type: PaymentTypes) => void;
  disabledOptions?: PaymentTypes[];
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const { disabledOptions = [], onClick } = props;
  const options = defaultPaymentOptions.filter(
    (option) => !disabledOptions?.includes(option),
  );

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
      {/* TODO: based on Smart Checkout result pass disabled={true/false} for Coins option */}
      {options.map((type) => (
        <PaymentOption onClick={onClick} type={type} key={type} />
      ))}
    </Box>
  );
}

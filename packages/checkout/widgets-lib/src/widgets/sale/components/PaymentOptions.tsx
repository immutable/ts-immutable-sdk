import { Box } from '@biom3/react';

import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { PaymentOption, PaymentOptionProps } from './PaymentOption';

const defaultPaymentOptions: SalePaymentTypes[] = [
  SalePaymentTypes.FIAT,
  SalePaymentTypes.CRYPTO,
];

export interface PaymentOptionsProps {
  onClick: (type: SalePaymentTypes) => void;
  disabledOptions?: SalePaymentTypes[];
  withErrors?: boolean;
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const { disabledOptions = [], onClick, withErrors = false } = props;

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
      {defaultPaymentOptions.map((type) => {
        const disabled = disabledOptions.includes(type);
        const disabledCaption: PaymentOptionProps['captionType'] = disabled ? 'disabledCaption' : 'caption';
        const captionType: PaymentOptionProps['captionType'] = withErrors ? 'noFundsCaption' : disabledCaption;

        return (
          <PaymentOption
            key={type}
            type={type}
            onClick={onClick}
            disabled={disabled}
            captionType={captionType}
          />
        );
      })}
    </Box>
  );
}

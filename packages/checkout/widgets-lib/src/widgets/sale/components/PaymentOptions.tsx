import { Box } from '@biom3/react';

import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { listItemVariants, listVariants } from 'lib/animation/listAnimation';
import { motion } from 'framer-motion';
import { PaymentOption } from './PaymentOption';

const defaultPaymentOptions: SalePaymentTypes[] = [
  SalePaymentTypes.CRYPTO,
  SalePaymentTypes.DEBIT,
  SalePaymentTypes.CREDIT,
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
      rc={
        <motion.div variants={listVariants} initial="hidden" animate="show" />
      }
    >
      {defaultPaymentOptions.map((type, idx: number) => (
        <PaymentOption
          key={`payment-type-${type}`}
          type={type}
          onClick={onClick}
          disabled={disabledOptions.includes(type)}
          rc={(
            <motion.div
              custom={idx}
              variants={listItemVariants}
            />
          )}
        />
      ))}
    </Box>
  );
}

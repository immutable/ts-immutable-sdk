import { Box, MenuItemSize } from '@biom3/react';

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
  paymentOptions?: SalePaymentTypes[];
  captions?: Partial<Record<SalePaymentTypes, string>>;
  size?: MenuItemSize;
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const {
    disabledOptions = [], paymentOptions, onClick, captions, size,
  } = props;
  const options = paymentOptions || defaultPaymentOptions;

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
      {options.map((type, idx: number) => (
        <PaymentOption
          key={`payment-type-${type}`}
          type={type}
          size={size}
          onClick={onClick}
          disabled={disabledOptions.includes(type)}
          caption={captions?.[type]}
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

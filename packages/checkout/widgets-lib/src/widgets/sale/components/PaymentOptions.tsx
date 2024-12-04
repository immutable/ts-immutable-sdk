import { Box, MenuItemSize } from '@biom3/react';

import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { motion } from 'framer-motion';
import { useContext, useEffect, useMemo } from 'react';
import { listItemVariants, listVariants } from '../../../lib/animation/listAnimation';
import { PaymentOption } from './PaymentOption';
import { ViewContext, SharedViews, ViewActions } from '../../../context/view-context/ViewContext';
import { useSaleEvent } from '../hooks/useSaleEvents';

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
  hideDisabledOptions?: boolean;
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const {
    disabledOptions = [],
    paymentOptions,
    onClick,
    captions,
    size,
    hideDisabledOptions,
  } = props;
  const options = useMemo(
    () => (paymentOptions || defaultPaymentOptions).filter(
      (option) => !hideDisabledOptions || !disabledOptions.includes(option),
    ),
    [paymentOptions, disabledOptions, hideDisabledOptions],
  );

  const { viewDispatch } = useContext(ViewContext);
  const { sendFailedEvent } = useSaleEvent();

  useEffect(() => {
    if (options.length === 0) {
      const error = new Error('No payment options available');
      sendFailedEvent(error.message, {}, [], undefined);

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
            error,
          },
        },
      });
    }
  }, [options]);

  useEffect(() => {
    if (options.length === 1) {
      onClick(options[0]);
    }
  }, [options, onClick]);

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
          rc={<motion.div custom={idx} variants={listItemVariants} />}
        />
      ))}
    </Box>
  );
}

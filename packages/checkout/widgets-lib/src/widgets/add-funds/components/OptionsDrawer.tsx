import { Box, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { listVariants } from '../../../lib/animation/listAnimation';
import { PaymentOptions } from '../../sale/components/PaymentOptions';

type OptionsDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onPayWithCard?: (paymentType: SalePaymentTypes) => void;
};

export function OptionsDrawer({
  visible,
  onClose,
  onPayWithCard,
}: OptionsDrawerProps) {
  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle="Pay with ..."
    >
      <Drawer.Content
        rc={
          <motion.div variants={listVariants} initial="hidden" animate="show" />
                }
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            px: 'base.spacing.x4',
          }}
        >
          <PaymentOptions
            onClick={onPayWithCard ?? (() => {})}
            size="medium"
            hideDisabledOptions
            paymentOptions={[SalePaymentTypes.DEBIT, SalePaymentTypes.CREDIT]}
            disabledOptions={[]}
            captions={{
              [SalePaymentTypes.DEBIT]: 'Debit',
              [SalePaymentTypes.CREDIT]: 'Credit',
            }}
          />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

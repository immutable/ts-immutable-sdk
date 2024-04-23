import { Box } from '@biom3/react';
import { SaleItem } from '@imtbl/checkout-sdk';
import { listVariants, listItemVariants } from 'lib/animation/listAnimation';

import { motion } from 'framer-motion';
import { OrderItem } from './OrderItem';
import { FundingBalance } from '../types';

type OrderItemsProps = {
  items: SaleItem[];
  balance: FundingBalance;
  conversions: Map<string, number>;
};

export function OrderItems({ items, balance, conversions }: OrderItemsProps) {
  return (
    <Box
      rc={
        <motion.div variants={listVariants} initial="hidden" animate="show" />
      }
    >
      {items.map((item, idx) => (
        <OrderItem
          key={item.name}
          item={item}
          balance={balance}
          conversions={conversions}
          rc={<motion.div variants={listItemVariants} custom={idx} />}
        />
      ))}
    </Box>
  );
}

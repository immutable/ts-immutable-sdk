import { Box, SxProps } from '@biom3/react';
import { SaleItem } from '@imtbl/checkout-sdk';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { listVariants, listItemVariants } from '../../../lib/animation/listAnimation';
import { OrderItem } from './OrderItem';
import { OrderQuoteProduct, FundingBalance } from '../types';
import { getPricingBySymbol } from '../utils/pricing';

const withFeesSx: SxProps = {
  mb: '0',
  bradbl: '0',
  bradbr: '0',
};

type OrderItemsProps = {
  items: SaleItem[];
  balance: FundingBalance;
  pricing: Record<string, OrderQuoteProduct>;
  conversions: Map<string, number>;
  children?: ReactNode;
};

export function OrderItems({
  items,
  balance,
  pricing,
  conversions,
  children: feesChildren,
}: OrderItemsProps) {
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
          size={items.length >= 3 ? 'small' : 'medium'}
          pricing={getPricingBySymbol(
            balance.fundingItem.token.symbol,
            pricing?.[item.productId]?.pricing,
            conversions,
          )}
          sx={idx === items.length - 1 && feesChildren ? withFeesSx : undefined}
          rc={<motion.div variants={listItemVariants} custom={idx} />}
        />
      ))}
      {feesChildren}
    </Box>
  );
}

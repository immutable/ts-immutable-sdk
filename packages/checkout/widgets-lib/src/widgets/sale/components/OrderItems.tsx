import { Box, SxProps } from '@biom3/react';
import { SaleItem } from '@imtbl/checkout-sdk';
import { listVariants, listItemVariants } from 'lib/animation/listAnimation';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { OrderItem } from './OrderItem';
import { OrderQuoteProduct, FundingBalance } from '../types';
import { getPricingBySymbol } from '../utils/pricing';

const singleItemSx: SxProps = {
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
  children,
}: OrderItemsProps) {
  const singleItem = items.length === 1 && children;

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
          size={items.length > 1 ? 'small' : 'medium'}
          pricing={getPricingBySymbol(
            balance.fundingItem.token.symbol,
            pricing?.[item.productId]?.pricing,
            conversions,
          )}
          sx={singleItem ? singleItemSx : undefined}
          rc={<motion.div variants={listItemVariants} custom={idx} />}
        />
      ))}
      {children}
    </Box>
  );
}

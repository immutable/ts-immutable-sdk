import {
  Box, Caption, Drawer, MenuItem,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { listVariants, listItemVariants } from 'lib/animation/listAnimation';
import { CoinsDrawerItem } from './CoinsDrawerItem';
import { FundingBalance } from '../types';

type CoinsDrawerProps = {
  conversions: Map<string, number>;
  balances: FundingBalance[];
  onSelect: (index: number) => void;
  onClose: () => void;
  selectedIndex: number;
  visible: boolean;
  loading: boolean;
};

export function CoinsDrawer({
  conversions,
  balances,
  onClose,
  onSelect,
  selectedIndex,
  visible,
  loading,
}: CoinsDrawerProps) {
  const { t } = useTranslation();
  const handleOnclick = (index: number) => () => {
    onSelect(index);
    onClose();
  };

  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle={t('views.ORDER_SUMMARY.coinsDrawer.header')}
    >
      <Drawer.Content
        rc={
          <motion.div variants={listVariants} initial="hidden" animate="show" />
        }
      >
        <Box sx={{ padding: 'base.spacing.x2' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Caption size="small">
              {t('views.ORDER_SUMMARY.coinsDrawer.caption1')}
            </Caption>
            <Caption size="small">
              {t('views.ORDER_SUMMARY.coinsDrawer.caption2')}
            </Caption>
          </Box>
          {balances.map((balance: FundingBalance, idx: number) => (
            <CoinsDrawerItem
              key={`${balance.fundingItem.token.symbol}-${balance.type}`}
              onClick={handleOnclick(idx)}
              balance={balance}
              selected={selectedIndex === idx}
              conversions={conversions}
              rc={<motion.div variants={listItemVariants} custom={idx} />}
            />
          ))}
          {loading && (
            <motion.div
              variants={listItemVariants}
              custom={balances.length}
              key="funding-balance-item-shimmer"
            >
              <MenuItem
                shimmer
                emphasized
                testId="funding-balance-item-shimmer"
              />
            </motion.div>
          )}
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

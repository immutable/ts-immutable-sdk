import {
  Box, Caption, Drawer, MenuItem, Divider,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { listVariants, listItemVariants } from 'lib/animation/listAnimation';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { CoinsDrawerItem } from './CoinsDrawerItem';
import { FundingBalance } from '../types';
import { PaymentOption } from './PaymentOption';

type CoinsDrawerProps = {
  conversions: Map<string, number>;
  balances: FundingBalance[];
  onSelect: (index: number) => void;
  onClose: () => void;
  onPayWithCard?: () => void;
  selectedIndex: number;
  visible: boolean;
  loading: boolean;
};

export function CoinsDrawer({
  conversions,
  balances,
  selectedIndex,
  visible,
  loading,
  onClose,
  onSelect,
  onPayWithCard,
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
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            px: 'base.spacing.x4',
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 'base.spacing.x4',
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
          {onPayWithCard && (
            <Box
              sx={{ pb: 'base.spacing.x4' }}
              rc={(
                <motion.div
                  variants={listItemVariants}
                  custom={balances.length + (loading ? 1 : 0)}
                />
              )}
            >
              <Divider
                size="small"
                rc={<Caption />}
                sx={{ my: 'base.spacing.x4' }}
              >
                {t('views.ORDER_SUMMARY.coinsDrawer.divider')}
              </Divider>
              <PaymentOption
                key="funding-balance-item-card"
                type={SalePaymentTypes.DEBIT}
                onClick={onPayWithCard}
                caption={t(
                  'views.ORDER_SUMMARY.coinsDrawer.payWithCard.caption',
                )}
              />
            </Box>
          )}
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

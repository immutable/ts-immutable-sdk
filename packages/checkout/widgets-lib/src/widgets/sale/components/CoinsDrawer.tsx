import {
  Box, Caption, Drawer, MenuItem, Divider,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { listVariants, listItemVariants } from 'lib/animation/listAnimation';
import { SalePaymentTypes, TransactionRequirement } from '@imtbl/checkout-sdk';
import { CoinsDrawerItem } from './CoinsDrawerItem';
import { FundingBalance } from '../types';
import { PaymentOptions } from './PaymentOptions';

type CoinsDrawerProps = {
  conversions: Map<string, number>;
  balances: FundingBalance[];
  selectedIndex: number;
  visible: boolean;
  loading: boolean;
  transactionRequirement?: TransactionRequirement;
  onSelect: (index: number) => void;
  onClose: () => void;
  onPayWithCard?: (paymentType: SalePaymentTypes) => void;
  disabledPaymentTypes?: SalePaymentTypes[];
};

export function CoinsDrawer({
  conversions,
  balances,
  selectedIndex,
  visible,
  loading,
  transactionRequirement,
  onClose,
  onSelect,
  onPayWithCard,
  disabledPaymentTypes,
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
                mb: 'base.spacing.x2',
              }}
            >
              <Caption size="small">
                {t('views.ORDER_SUMMARY.coinsDrawer.caption1')}
              </Caption>
              <Caption size="small">
                {t('views.ORDER_SUMMARY.coinsDrawer.caption2')}
              </Caption>
            </Box>
            {balances?.map((balance: FundingBalance, idx: number) => (
              <CoinsDrawerItem
                key={`${balance.fundingItem.token.symbol}-${balance.type}`}
                onClick={handleOnclick(idx)}
                balance={balance}
                selected={selectedIndex === idx}
                conversions={conversions}
                transactionRequirement={transactionRequirement}
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
              <PaymentOptions
                onClick={onPayWithCard}
                paymentOptions={[SalePaymentTypes.DEBIT, SalePaymentTypes.CREDIT].filter(
                  (type) => !disabledPaymentTypes?.includes(type),
                )}
                captions={{
                  [SalePaymentTypes.DEBIT]: t(
                    'views.PAYMENT_METHODS.options.debit.caption',
                  ),
                  [SalePaymentTypes.CREDIT]: t(
                    'views.PAYMENT_METHODS.options.credit.caption',
                  ),
                }}
              />
            </Box>
          )}
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}

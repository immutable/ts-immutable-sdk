import { Box, Heading } from '@biom3/react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SaleItem,
  SalePaymentTypes,
  TransactionRequirement,
} from '@imtbl/checkout-sdk';
import { OrderSummarySubViews } from 'context/view-context/SaleViewContextTypes';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { SelectCoinDropdown } from './SelectCoinDropdown';
import { CoinsDrawer } from './CoinsDrawer';
import { OrderQuoteProduct, FundingBalance } from '../types';
import { OrderItems } from './OrderItems';
import { useSaleEvent } from '../hooks/useSaleEvents';

type OrderReviewProps = {
  collectionName: string;
  fundingBalances: FundingBalance[];
  conversions: Map<string, number>;
  loadingBalances: boolean;
  items: SaleItem[];
  pricing: Record<string, OrderQuoteProduct>;
  transactionRequirement?: TransactionRequirement;
  onBackButtonClick: () => void;
  onProceedToBuy: (fundingBalance: FundingBalance) => void;
  onPayWithCard?: (paymentType: SalePaymentTypes) => void;
  disabledPaymentTypes?: SalePaymentTypes[];
};

export function OrderReview({
  items,
  pricing,
  fundingBalances,
  conversions,
  collectionName,
  loadingBalances,
  transactionRequirement,
  onBackButtonClick,
  onPayWithCard,
  onProceedToBuy,
  disabledPaymentTypes,
}: OrderReviewProps) {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { t } = useTranslation();
  const { sendSelectedPaymentToken } = useSaleEvent();

  const [showCoinsDrawer, setShowCoinsDrawer] = useState(false);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0);

  const openDrawer = () => {
    setShowCoinsDrawer(true);
  };

  const closeDrawer = () => {
    setShowCoinsDrawer(false);
  };

  const onSelect = (selectedIndex: number) => {
    setSelectedCurrencyIndex(selectedIndex);

    const { fundingItem } = fundingBalances[selectedCurrencyIndex];
    sendSelectedPaymentToken(OrderSummarySubViews.REVIEW_ORDER, fundingItem, conversions);
    // checkoutPrimarySalePaymentTokenSelected
  };

  return (
    <SimpleLayout
      testId="order-review"
      header={(
        <HeaderNavigation
          showBack
          onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
          onBackButtonClick={onBackButtonClick}
          title={collectionName}
        />
      )}
      bodyStyleOverrides={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '0',
      }}
    >
      <Heading
        size="small"
        sx={{
          px: 'base.spacing.x4',
          pb: 'base.spacing.x4',
        }}
      >
        {t('views.ORDER_SUMMARY.orderReview.heading')}
      </Heading>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: 'base.spacing.x2',
          pb: 'base.spacing.x8',
          maxh: '60%',
          height: '100%',
          overflowY: 'auto',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Box sx={{ px: 'base.spacing.x2' }}>
          <OrderItems
            items={items}
            balance={fundingBalances[selectedCurrencyIndex]}
            pricing={pricing}
            conversions={conversions}
          />
        </Box>
      </Box>
      <SelectCoinDropdown
        onClick={openDrawer}
        onProceed={onProceedToBuy}
        balance={fundingBalances[selectedCurrencyIndex]}
        conversions={conversions}
        canOpen={fundingBalances.length > 1}
        loading={loadingBalances}
        priceDisplay={items.length > 1}
      />
      <CoinsDrawer
        conversions={conversions}
        balances={fundingBalances}
        onSelect={onSelect}
        onClose={closeDrawer}
        selectedIndex={selectedCurrencyIndex}
        visible={showCoinsDrawer}
        loading={loadingBalances}
        onPayWithCard={onPayWithCard}
        transactionRequirement={transactionRequirement}
        disabledPaymentTypes={disabledPaymentTypes}
      />
    </SimpleLayout>
  );
}

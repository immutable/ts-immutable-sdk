import { Box, Heading } from '@biom3/react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SaleItem,
  SalePaymentTypes,
  TransactionRequirement,
  WidgetTheme,
} from '@imtbl/checkout-sdk';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { SelectCoinDropdown } from './SelectCoinDropdown';
import { CoinsDrawer } from './CoinsDrawer';
import { FundingBalance } from '../types';
import { OrderItems } from './OrderItems';

type OrderReviewProps = {
  collectionName: string;
  fundingBalances: FundingBalance[];
  conversions: Map<string, number>;
  loadingBalances: boolean;
  items: SaleItem[];
  transactionRequirement?: TransactionRequirement;
  onBackButtonClick: () => void;
  onProceedToBuy: (fundingBalance: FundingBalance) => void;
  onPayWithCard?: (paymentType: SalePaymentTypes) => void;
  disabledPaymentTypes?: SalePaymentTypes[];
  theme: WidgetTheme;
};

export function OrderReview({
  items,
  fundingBalances,
  conversions,
  collectionName,
  loadingBalances,
  transactionRequirement,
  onBackButtonClick,
  onPayWithCard,
  onProceedToBuy,
  disabledPaymentTypes,
  theme,
}: OrderReviewProps) {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { t } = useTranslation();

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
      footer={<FooterLogo />}
      bodyStyleOverrides={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Heading
          size="small"
          sx={{
            paddingX: 'base.spacing.x4',
          }}
        >
          {t('views.ORDER_SUMMARY.orderReview.heading')}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <OrderItems
            items={items}
            balance={fundingBalances[selectedCurrencyIndex]}
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
      />
      <CoinsDrawer
        theme={theme}
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

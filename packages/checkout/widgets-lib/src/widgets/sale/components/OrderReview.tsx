import { Box, Heading } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FundingStepType,
  SaleItem,
  SalePaymentTypes,
  TransactionRequirement,
} from '@imtbl/checkout-sdk';
import {
  OrderSummarySubViews,
  SaleWidgetViews,
} from 'context/view-context/SaleViewContextTypes';
import { calculateCryptoToFiat } from 'lib/utils';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { SelectCoinDropdown } from './SelectCoinDropdown';
import { CoinsDrawer } from './CoinsDrawer';
import { OrderQuoteProduct, FundingBalance } from '../types';
import { OrderItems } from './OrderItems';
import { useSaleEvent } from '../hooks/useSaleEvents';
import {
  getFundingBalanceFeeBreakDown,
  getFundingBalanceTotalFees,
} from '../functions/fundingBalanceFees';
import { FeesDisplay, OrderFees } from './OrderFees';

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
  const { sendSelectedPaymentToken, sendViewFeesEvent } = useSaleEvent();

  const [showCoinsDrawer, setShowCoinsDrawer] = useState(false);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0);
  const [swapFees, setSwapFees] = useState<FeesDisplay>({
    token: undefined,
    amount: '',
    fiatAmount: '',
    breakdown: [],
  });

  const openDrawer = () => {
    setShowCoinsDrawer(true);
  };

  const closeDrawer = () => {
    setShowCoinsDrawer(false);
  };

  const onSelect = (selectedIndex: number) => {
    setSelectedCurrencyIndex(selectedIndex);

    const { fundingItem } = fundingBalances[selectedIndex];
    sendSelectedPaymentToken(
      OrderSummarySubViews.REVIEW_ORDER,
      fundingItem,
      conversions,
    );
    // checkoutPrimarySalePaymentTokenSelected
  };

  const fundingBalance = useMemo(
    () => fundingBalances[selectedCurrencyIndex],
    [fundingBalances, selectedCurrencyIndex],
  );

  useEffect(() => {
    if (!conversions?.size) {
      return;
    }

    if (fundingBalance.type !== FundingStepType.SWAP) {
      return;
    }

    const [[, fee]] = Object.entries(
      getFundingBalanceTotalFees(fundingBalance),
    );
    if (!fee || !fee.token) {
      return;
    }

    const values = {
      token: fee.token,
      amount: fee.formattedAmount,
      fiatAmount: calculateCryptoToFiat(
        fee.formattedAmount,
        fee.token.symbol,
        conversions,
      ),
      breakdown: getFundingBalanceFeeBreakDown(fundingBalance, conversions),
    };

    setSwapFees(values);
  }, [fundingBalance, conversions]);

  const multiple = items.length > 1;
  const withFees = !loadingBalances && fundingBalance.type === FundingStepType.SWAP;

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
          flex: 1,
          maxh: withFees ? '45%' : '60%',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Box sx={{ px: 'base.spacing.x2' }}>
          <OrderItems
            items={items}
            balance={fundingBalances[selectedCurrencyIndex]}
            pricing={pricing}
            conversions={conversions}
          >
            {!multiple && withFees && (
              <OrderFees
                swapFees={swapFees}
                sx={{
                  bradtl: '0',
                  bradtr: '0',
                  brad: 'base.borderRadius.x6',
                  border: '0px solid transparent',
                  borderTopWidth: 'base.border.size.200',
                  borderTopColor: 'base.color.translucent.inverse.1000',
                }}
                onFeesClick={() => sendViewFeesEvent(SaleWidgetViews.ORDER_SUMMARY)}
              />
            )}
          </OrderItems>
        </Box>
      </Box>
      {multiple && withFees && (
        <OrderFees
          swapFees={swapFees}
          sx={{
            mb: '-12px',
            bradtl: 'base.borderRadius.x6',
            bradtr: 'base.borderRadius.x6',
            border: '0px solid transparent',
            borderTopWidth: 'base.border.size.100',
            borderTopColor: 'base.color.translucent.emphasis.400',
          }}
          onFeesClick={() => sendViewFeesEvent(SaleWidgetViews.ORDER_SUMMARY)}
        />
      )}
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

import { Box, Heading } from '@biom3/react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { SelectCoinDropdown } from './SelectCoinDropdown';
import { CoinsDrawer } from './CoinsDrawer';
import { FundingBalance } from '../types';

type OrderReviewProps = {
  collectionName: string;
  fundingBalances: FundingBalance[];
  conversions: Map<string, number>;
  loadingBalances: boolean;
};

export function OrderReview({
  fundingBalances,
  conversions,
  collectionName,
  loadingBalances,
}: OrderReviewProps) {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { t } = useTranslation();

  const [showCoinsDrawer, setShowCoinsDrawer] = useState(true);
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
          onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
          title={collectionName}
        />
      )}
      footer={<FooterLogo />}
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
          <SelectCoinDropdown
            onClick={openDrawer}
            balance={fundingBalances[selectedCurrencyIndex]}
            conversions={conversions}
            canOpen={fundingBalances.length > 1}
          />
        </Box>
      </Box>
      <CoinsDrawer
        conversions={conversions}
        balances={fundingBalances}
        onSelect={onSelect}
        onClose={closeDrawer}
        selectedIndex={selectedCurrencyIndex}
        visible={showCoinsDrawer}
        loading={loadingBalances}
      />
    </SimpleLayout>
  );
}

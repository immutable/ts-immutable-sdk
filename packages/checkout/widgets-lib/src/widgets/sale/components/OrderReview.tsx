import { Box, Heading } from '@biom3/react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { SelectCoinDropdown } from './SelectCoinDropdown';
import { CoinsDrawer } from './CoinsDrawer';

type OrderReviewProps = {
  collectionName: string;
  currencies: SaleWidgetCurrency[];
  conversions: Map<string, number>;
};

export function OrderReview({
  currencies,
  conversions,
  collectionName,
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
            currency={currencies[selectedCurrencyIndex]}
            conversions={conversions}
            canOpen={currencies.length > 1}
          />
        </Box>
      </Box>
      <CoinsDrawer
        conversions={conversions}
        currencies={currencies}
        onSelect={onSelect}
        onClose={closeDrawer}
        selectedIndex={selectedCurrencyIndex}
        visible={showCoinsDrawer}
      />
    </SimpleLayout>
  );
}

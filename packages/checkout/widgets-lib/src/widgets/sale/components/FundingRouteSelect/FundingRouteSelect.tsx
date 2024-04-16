import {
  Body, Box, Button, Heading,
} from '@biom3/react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { BigNumber } from 'ethers';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { FundingRouteDrawer } from '../FundingRouteSelectDrawer/FundingRouteDrawer';
import { PurchaseMenuItem } from '../PurchaseMenuItem/PurchaseMenuItem';
import { sendSaleWidgetCloseEvent } from '../../SaleWidgetEvents';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { useSaleContext } from '../../context/SaleContextProvider';

type FundingRouteSelectProps = {
  collectionName: string;
  currencies: SaleWidgetCurrency[];
  onSelect: (currency: SaleWidgetCurrency) => void;
};

export function FundingRouteSelect({
  // fundingRoutes,
  collectionName,
  currencies,
  onSelect,
}: FundingRouteSelectProps) {
  const { t } = useTranslation();
  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);
  const [selectedCurrencyIndex, setselectedCurrencyIndex] = useState(0);
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  // const { viewDispatch } = useContext(ViewContext);
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { goBackToPaymentMethods, amount } = useSaleContext();

  const onClickContinue = () => {
    // proceed with selected currency if settlement
    // if not start swap
    // onSelect(fundingRoutes[selectedCurrencyIndex]);
    // viewDispatch({
    //   payload: {
    //     type: ViewActions.UPDATE_VIEW,
    //     view: {
    //       type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
    //       subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE,
    //     },
    //   },
    // });
  };

  const closeDrawer = (selectedFundingRouteIndex: number) => {
    // close drawer, set selected currency
    setselectedCurrencyIndex(selectedFundingRouteIndex);
    setSmartCheckoutDrawerVisible(false);
  };

  const onSmartCheckoutDropdownClick = () => {
    if (currencies.length === 0) return;

    // close drawer
    setSmartCheckoutDrawerVisible(true);
  };

  if (!currencies) return null;

  return (
    <SimpleLayout
      testId="funding-route-select"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
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
          height: '100%',
        }}
      >
        <Heading size="small">
          {t('views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.heading')}
        </Heading>

        {currencies.length === 0
          ? [
            <Body key="noRoutesAvailableText" size="small">
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.noRoutesAvailable',
              )}
            </Body>,
            <Button key="payWithCardButton" variant="tertiary">
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.payWithCard',
              )}
            </Button>,
          ]
          : [
            <FundingRouteMenuItem
              data-testid="funding-route-select-selected-route"
              onClick={onSmartCheckoutDropdownClick}
              currency={{
                ...currencies[selectedCurrencyIndex],
                userBalance: {
                  balance: BigNumber.from(amount),
                  formattedBalance: amount,
                },
              }}
              conversions={cryptoFiatState.conversions}
              toggleVisible={currencies.length > 1}
              key="selectedFundingRouteMenuItem"
            />,
            <PurchaseMenuItem
              key="purchaseMenuItem"
              currency={currencies[selectedCurrencyIndex]}
              collectionName={collectionName}
            />,
            <Button
              key="continueButton"
              sx={{ mt: 'auto' }}
              variant="primary"
              onClick={onClickContinue}
            >
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.continue',
              )}
            </Button>,
            <Button
              key="payWithCardButton"
              variant="tertiary"
              onClick={() => goBackToPaymentMethods()}
            >
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.payWithCardInstead',
              )}
            </Button>,
          ]}
      </Box>
      <FundingRouteDrawer
        visible={smartCheckoutDrawerVisible}
        onCloseDrawer={closeDrawer}
        currencies={currencies}
        selectedIndex={selectedCurrencyIndex}
        conversions={cryptoFiatState.conversions}
      />
    </SimpleLayout>
  );
}

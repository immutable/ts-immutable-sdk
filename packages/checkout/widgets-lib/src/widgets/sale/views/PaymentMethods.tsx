import { Banner, Box, Heading } from '@biom3/react';
import { useContext, useEffect } from 'react';

import { RoutingOutcomeType } from '@imtbl/checkout-sdk';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FundWithSmartCheckoutSubViews, SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { text as textConfig } from '../../../resources/text/textConfig';

import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';

import { PaymentOptions } from '../components/PaymentOptions';

import { useSaleContext } from '../context/SaleContextProvider';
import { PaymentTypes } from '../types';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PaymentMethods() {
  const text = { methods: textConfig.views[SaleWidgetViews.PAYMENT_METHODS] };
  const { viewState, viewDispatch } = useContext(ViewContext);
  const {
    paymentMethod, setPaymentMethod, sign, smartCheckoutResult,
  } = useSaleContext();
  const { sendPageView, sendCloseEvent, sendSelectedPaymentMethod } = useSaleEvent();

  const handleOptionClick = (type: PaymentTypes) => setPaymentMethod(type);

  useEffect(() => {
    if (paymentMethod) {
      sendSelectedPaymentMethod(paymentMethod, SaleWidgetViews.PAYMENT_METHODS);
    }

    if (paymentMethod === PaymentTypes.FIAT) {
      sign(paymentMethod, () => {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SaleWidgetViews.PAY_WITH_CARD,
            },
          },
        });
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.LOADING_VIEW,
            data: { loadingText: text.methods.loading.ready },
          },
        },
      });
    }

    if (paymentMethod === PaymentTypes.CRYPTO) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
            subView: FundWithSmartCheckoutSubViews.INIT,
          },
        },
      });
    }
  }, [paymentMethod]);

  const insufficientCoinsBanner = (
    <Box sx={{ paddingX: 'base.spacing.x2' }}>
      <Banner>
        <Banner.Icon icon="InformationCircle" />
        <Banner.Caption>
          {text.methods.insufficientCoinsBanner.caption}
        </Banner.Caption>
      </Banner>
    </Box>
  );

  const disabledOptions = () => {
    if (smartCheckoutResult?.sufficient) {
      return [];
    }
    if (smartCheckoutResult?.router.routingOutcome.type === RoutingOutcomeType.NO_ROUTES_FOUND
      || smartCheckoutResult?.router.routingOutcome.type === RoutingOutcomeType.NO_ROUTE_OPTIONS) {
      return [PaymentTypes.CRYPTO];
    }
    return [];
  };

  useEffect(() => sendPageView(SaleWidgetViews.PAYMENT_METHODS), []);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendCloseEvent(SaleWidgetViews.PAYMENT_METHODS)}
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
          {text.methods.header.heading}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <PaymentOptions disabledOptions={disabledOptions()} onClick={handleOptionClick} />
        </Box>
        {viewState.view.data?.showInsufficientCoinsBanner ? insufficientCoinsBanner : null}
      </Box>
    </SimpleLayout>
  );
}

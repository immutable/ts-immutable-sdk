/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
  useCallback, useContext, useEffect,
} from 'react';
import { Box, Heading } from '@biom3/react';

import { RoutingOutcomeType } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { FundWithSmartCheckoutSubViews, SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';

import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { PaymentOptions } from '../components/PaymentOptions';

import { useSaleContext } from '../context/SaleContextProvider';
import { PaymentTypes, SaleErrorTypes } from '../types';

export function PaymentMethods() {
  const text = { methods: textConfig.views[SaleWidgetViews.PAYMENT_METHODS] };
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const {
    paymentMethod, setPaymentMethod, sign, querySmartCheckout,
  } = useSaleContext();

  const handleOptionClick = (type: PaymentTypes) => setPaymentMethod(type);

  const handleGoToPaymentView = useCallback((type: PaymentTypes) => {
    if (type === PaymentTypes.CRYPTO) {
      if (!querySmartCheckout) {
        // we need this, not sure what should happen for the user if not defined
        return;
      }
      querySmartCheckout((res) => {
        if (res?.sufficient) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SaleWidgetViews.PAY_WITH_COINS,
              },
            },
          });
        } else if (res?.router.routingOutcome?.type === RoutingOutcomeType.ROUTES_FOUND) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
                subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT,
              },
            },
          });
        } else {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SaleWidgetViews.SALE_FAIL,
                data: {
                  errorType: SaleErrorTypes.INSUFFICIENT_BALANCE,
                },
              },
            },
          });
        }
      });
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.LOADING_VIEW,
          },
        },
      });
    }

    if (type === PaymentTypes.FIAT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAY_WITH_CARD,
          },
        },
      });
    }
  }, [querySmartCheckout]);

  useEffect(() => {
    if (paymentMethod) {
      sign(paymentMethod);
      handleGoToPaymentView(paymentMethod);
    }
  }, [paymentMethod, querySmartCheckout]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        id="payment-methods-content"
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
          <PaymentOptions
            onClick={handleOptionClick}
          />
        </Box>
      </Box>
    </SimpleLayout>
  );
}

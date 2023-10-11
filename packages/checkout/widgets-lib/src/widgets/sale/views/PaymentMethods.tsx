/* eslint-disable no-console */
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { Box, Heading } from '@biom3/react';

import { RoutingOutcomeType } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';

import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { PaymentOptions } from '../components/PaymentOptions';

import { useSaleContext } from '../context/SaleContextProvider';
import { PaymentTypes } from '../types';

export function PaymentMethods() {
  const text = { methods: textConfig.views[SaleWidgetViews.PAYMENT_METHODS] };
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const {
    paymentMethod, setPaymentMethod, sign, querySmartCheckout,
  } = useSaleContext();
  const [payWithCryptoEnabled, setPayWithCryptoEnabled] = useState(false);

  const handleOptionClick = (type: PaymentTypes) => setPaymentMethod(type);

  const handleGoToPaymentView = useCallback((type: PaymentTypes) => {
    if (type === PaymentTypes.CRYPTO) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAY_WITH_COINS,
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
  }, []);

  useEffect(() => {
    if (!querySmartCheckout) {
      return;
    }
    const callQuerySmartCheckout = async () => {
      const smartCheckoutResult = await querySmartCheckout();
      console.log('@@@@@@@@ querySmartCheckout', smartCheckoutResult);
      if (smartCheckoutResult?.sufficient) {
        setPayWithCryptoEnabled(true);
      } else if (smartCheckoutResult?.router.routingOutcome?.type === RoutingOutcomeType.ROUTES_FOUND) {
        setPayWithCryptoEnabled(true);
      } else {
        setPayWithCryptoEnabled(false);
      }
    };

    callQuerySmartCheckout()
      .catch(console.error);
  }, [querySmartCheckout]);

  useEffect(() => {
    if (paymentMethod) {
      sign(paymentMethod);
      handleGoToPaymentView(paymentMethod);
    }
  }, [paymentMethod]);

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
            disabledOptions={payWithCryptoEnabled ? undefined : [PaymentTypes.CRYPTO]}
            onClick={handleOptionClick}
          />
        </Box>
      </Box>
    </SimpleLayout>
  );
}

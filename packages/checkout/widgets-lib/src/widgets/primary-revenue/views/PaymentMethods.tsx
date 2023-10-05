/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
import { useCallback, useContext, useEffect } from 'react';
import { Box, Heading } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenueWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

import { useSharedContext } from '../context/SharedContextProvider';
import { PaymentTypes } from '../types';

import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';

export function PaymentMethods() {
  const text = {
    methods: textConfig.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS],
  };
  const { viewDispatch } = useContext(ViewContext);
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const {
    paymentMethod, setPaymentMethod, sign, signResponse,
  } = useSharedContext();

  const handleOptionClick = useCallback((type: PaymentTypes) => setPaymentMethod(type), []);

  const handleGoToPaymentView = useCallback((type: PaymentTypes) => {
    if (type === PaymentTypes.CRYPTO) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: PrimaryRevenueWidgetViews.PAY_WITH_COINS,
          },
        },
      });
    }

    if (type === PaymentTypes.FIAT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: PrimaryRevenueWidgetViews.PAY_WITH_CARD,
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (paymentMethod && !signResponse) {
      sign(paymentMethod, () => handleGoToPaymentView(paymentMethod));
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.LOADING_VIEW,
            data: { loadingText: text.methods.loading },
          },
        },
      });
    }
  }, [paymentMethod]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendPrimaryRevenueWidgetCloseEvent(eventTarget)}
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
          <button
            type="button"
            onClick={() => handleOptionClick(PaymentTypes.CRYPTO)}
          >
            {
              text.methods.options[PrimaryRevenueWidgetViews.PAY_WITH_COINS]
                .heading
            }
          </button>
          <button
            type="button"
            onClick={() => handleOptionClick(PaymentTypes.FIAT)}
          >
            {
              text.methods.options[PrimaryRevenueWidgetViews.PAY_WITH_CARD]
                .heading
            }
          </button>
        </Box>
      </Box>
    </SimpleLayout>
  );
}

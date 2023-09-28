/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
import {
  useCallback, useContext, useEffect, useMemo,
} from 'react';
import { Box, Heading } from '@biom3/react';

import { use } from 'chai';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenueWidgetEvents';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

import { useSharedContext } from '../context/SharedContextProvider';
import { PaymentTypes } from '../types';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';

type PaymentMethodsProps = {
  config: StrongCheckoutWidgetsConfig;
};
export function PaymentMethods(props: PaymentMethodsProps) {
  const methodsText = textConfig.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const cardText = methodsText.options[PrimaryRevenueWidgetViews.PAY_WITH_CARD];
  const coinsText = methodsText.options[PrimaryRevenueWidgetViews.PAY_WITH_COINS];
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { viewDispatch } = useContext(ViewContext);

  const {
    paymentMethod, setPaymentMethod, sign, signResponse,
  } = useSharedContext();

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
            data: { loadingText: methodsText.loading },
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
          {methodsText.header.heading}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <button
            type="button"
            onClick={() => setPaymentMethod(PaymentTypes.CRYPTO)}
          >
            {coinsText.heading}
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod(PaymentTypes.FIAT)}
          >
            {cardText.heading}
          </button>
        </Box>
      </Box>
    </SimpleLayout>
  );
}

import { useCallback, useContext } from 'react';
import { Box, Heading } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';

import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenueWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { PaymentOptions } from '../components/PaymentOptions';

export function PaymentMethods() {
  const text = {
    methods: textConfig.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS],
    coins: textConfig.views[PrimaryRevenueWidgetViews.PAY_WITH_COINS],
    card: textConfig.views[PrimaryRevenueWidgetViews.PAY_WITH_CARD],
  };
  const { viewDispatch, viewState } = useContext(ViewContext);
  const { amount, fromContractAddress } = viewState.view.data || {};
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const handleOptionClick = useCallback(
    async (type: PrimaryRevenueWidgetViews) => {
      if (type === PrimaryRevenueWidgetViews.PAY_WITH_CARD) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: PrimaryRevenueWidgetViews.PAY_WITH_CARD,
            },
          },
        });
        return;
      }

      if (type === PrimaryRevenueWidgetViews.PAY_WITH_COINS) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: PrimaryRevenueWidgetViews.PAY_WITH_COINS,
            },
          },
        });
        return;
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error: Error('Invalid payment type'),
          },
        },
      });
    },
    [viewDispatch, amount, fromContractAddress],
  );

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
          <PaymentOptions onClick={handleOptionClick} />
        </Box>
      </Box>
    </SimpleLayout>
  );
}

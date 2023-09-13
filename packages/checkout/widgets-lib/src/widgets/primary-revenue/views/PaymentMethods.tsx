/* eslint-disable no-unused-vars */

import { useCallback, useContext, useEffect } from 'react';
import { Box, Heading } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text } from '../../../resources/text/textConfig';
import { PaymentOptions } from '../components/PaymentOptions';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';
import { PaymentType, SignResponse } from '../hooks/useSignOrder';
import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenuWidgetEvents';

export interface PaymentMethodsProps {
  checkBalances: () => Promise<boolean>;
  sign: (paymentType: PaymentType) => Promise<SignResponse | undefined>;
}

export function PaymentMethods({ checkBalances, sign }: PaymentMethodsProps) {
  const { header } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const { viewDispatch, viewState } = useContext(ViewContext);

  const { amount, fromContractAddress } = viewState.view.data || {};

  const handleOptionClick = useCallback(
    async (type: PrimaryRevenueWidgetViews) => {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SharedViews.LOADING_VIEW },
        },
      });

      try {
        const hasEnoughBalance = await checkBalances();

        if (
          hasEnoughBalance
          && type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO
        ) {
          const signResponse = await sign(PaymentType.CRYPTO);

          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO,
                data: signResponse,
              },
            },
          });
        } else if (
          !hasEnoughBalance
          && type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO
        ) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SharedViews.TOP_UP_VIEW,
                bridgeData: {
                  fromAmount: amount,
                  fromContractAddress,
                },
              },
            },
          });
        } else {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: PrimaryRevenueWidgetViews.PAY_WITH_CARD },
            },
          });
        }
      } catch (err: any) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: SharedViews.ERROR_VIEW, error: err },
          },
        });
      }
    },
    [checkBalances, sign],
  );

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: PaymentMethodsntMethods ~ viewState:', viewState);
  }, [viewState]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={<HeaderNavigation onCloseButtonClick={() => sendPrimaryRevenueWidgetCloseEvent()} />}
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
          {header.heading}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <PaymentOptions onClick={handleOptionClick} />
        </Box>
      </Box>
    </SimpleLayout>
  );
}

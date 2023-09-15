/* eslint-disable no-unused-vars */

import {
  useCallback, useContext, useEffect,
} from 'react';
import { Box, Heading } from '@biom3/react';

import { SmartCheckoutResult } from '@imtbl/checkout-sdk';
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
import { SmartCheckoutInput } from '../hooks/useSmartCheckout';
import { sendPrimaryRevenueWidgetCloseEvent } from '../PrimaryRevenuWidgetEvents';

export interface PaymentMethodsProps {
  checkBalances: () => Promise<boolean>;
  sign: (paymentType: PaymentType) => Promise<SignResponse | undefined>;
  // SmartCheckout currently returns Promise<void> but later will return Promise<SmartCheckoutResult>
  smartCheckout: (x: SmartCheckoutInput) => Promise<SmartCheckoutResult | void>;

}

export function PaymentMethods({ checkBalances, sign, smartCheckout }: PaymentMethodsProps) {
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

          const approveTx = signResponse?.transactions.find(
            (tx) => tx.method_call === 'approve(address spender,uint256 amount)',
          );

          // eslint-disable-next-line no-console
          console.log('@@@@@@@@ PaymentMethods.tsx signResponse', signResponse);
          const smartCheckoutRes = await smartCheckout({
            spenderAddress: approveTx?.params.spender || '',
            amount: `${signResponse?.order.total_amount}`,
            contractAddress: approveTx?.contract_address || '',
          });

          // Use smartCheckoutRes to determine if crypto payment is possible
          // waiting on fundingRoutes being return by SmartCheckout
          // eslint-disable-next-line no-console
          console.log('@@@@@@@@ PaymentMethods.tsx smartCheckoutRes', smartCheckoutRes);

          let sufficient = smartCheckoutRes?.sufficient;
          if (!smartCheckoutRes) {
            // SmartCheckout still being developed - for now assume sufficient
            sufficient = true;
            // eslint-disable-next-line no-console
            console.log('@@@@@@@@ PaymentMethods.tsx SmartCheckout unable to return');
          }

          if (sufficient) {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO,
                  data: signResponse,
                },
              },
            });
          } else {
            // Take user to SC Orchestrator
            // eslint-disable-next-line no-console
            console.log('@@@@@@@@ PaymentMethods.tsx not enough funds -> sending to SC Ochestrator');
          }
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
          <PaymentOptions
            onClick={handleOptionClick}
          />
        </Box>
      </Box>
    </SimpleLayout>
  );
}

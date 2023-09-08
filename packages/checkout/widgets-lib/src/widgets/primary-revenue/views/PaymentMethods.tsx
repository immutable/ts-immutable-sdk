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

export interface PaymentMethodsProps {
  checkBalances: () => Promise<boolean>;
  setPaymentType: (type: 'fiat' | 'crypto' | undefined) => void;
}

export function PaymentMethods(props: PaymentMethodsProps) {
  const { checkBalances, setPaymentType } = props;
  const { header } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const { viewDispatch, viewState } = useContext(ViewContext);

  const {
    amount,
    // envId,
    // fromCurrency,
    // items,
    fromContractAddress,
  } = viewState.view.data || {};

  const handleOptionClick = useCallback(
    async (type: PrimaryRevenueWidgetViews) => {
      setPaymentType(
        type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO ? 'crypto' : 'fiat',
      );

      try {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: SharedViews.LOADING_VIEW },
          },
        });

        const hasEnoughBalance = await checkBalances();

        // FIXME: best way to handle conditional routing?
        if (
          !hasEnoughBalance
          && type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO
        ) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SharedViews.TOP_UP_VIEW,
                data: {},
                bridgeData: {
                  fromAmount: amount,
                  fromContractAddress,
                },
                swapData: {
                  fromContractAddress: '',
                  fromAmount: amount,
                  toContractAddress: fromContractAddress,
                },
              },
            },
          });

          return;
        }

        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: type as any },
          },
        });
      } catch (err: any) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: SharedViews.ERROR_VIEW, error: err },
          },
        });
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: PaymentMethodsntMethods ~ viewState:', viewState);
  }, [viewState]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={<HeaderNavigation onCloseButtonClick={() => {}} />}
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

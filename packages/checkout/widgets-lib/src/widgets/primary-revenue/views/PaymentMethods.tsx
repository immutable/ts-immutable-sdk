/* eslint-disable no-unused-vars */

import { useCallback, useContext } from 'react';
import { Body, Box } from '@biom3/react';

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
}

export function PaymentMethods(props: PaymentMethodsProps) {
  const { checkBalances } = props;
  const { header } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const { viewDispatch } = useContext(ViewContext);

  const handleOptionClick = useCallback(
    async (type: PrimaryRevenueWidgetViews) => {
      try {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: SharedViews.LOADING_VIEW },
          },
        });

        const hasEnoughBalance = await checkBalances();

        // FIXME: best way to handle conditional routing?
        if (!hasEnoughBalance && type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: SharedViews.TOP_UP_VIEW },
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

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          title={header.heading}
          onCloseButtonClick={() => {}}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          rowGap: 'base.spacing.x9',
        }}
      >
        <Body
          size="small"
          sx={{
            color: 'base.color.text.secondary',
            paddingX: 'base.spacing.x2',
          }}
        >
          {header.caption}
        </Body>
        <PaymentOptions onClick={handleOptionClick} />
      </Box>
    </SimpleLayout>
  );
}

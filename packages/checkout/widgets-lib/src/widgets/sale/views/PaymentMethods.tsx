/* eslint-disable no-console */
import {
  Banner, Box, Heading, Link,
} from '@biom3/react';
import { useContext, useEffect } from 'react';

import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FundWithSmartCheckoutSubViews, SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';

import { PaymentOptions } from '../components/PaymentOptions';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { SaleErrorTypes } from '../types';

export function PaymentMethods() {
  const { t } = useTranslation();
  const { viewState, viewDispatch } = useContext(ViewContext);
  const {
    sign,
    goToErrorView,
    paymentMethod,
    setPaymentMethod,
    disabledPaymentTypes,
    invalidParameters,
  } = useSaleContext();
  const { sendPageView, sendCloseEvent, sendSelectedPaymentMethod } = useSaleEvent();

  const handleOptionClick = (type: SalePaymentTypes) => setPaymentMethod(type);

  useEffect(() => {
    if (paymentMethod) {
      sendSelectedPaymentMethod(paymentMethod, SaleWidgetViews.PAYMENT_METHODS);
    }

    if (paymentMethod === SalePaymentTypes.FIAT) {
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
            data: { loadingText: t('views.PAYMENT_METHODS.loading.ready') },
          },
        },
      });
    }

    if (paymentMethod === SalePaymentTypes.CRYPTO) {
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

  const onClickInsufficientCoinsBanner = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.TOP_UP_VIEW,
        },
      },
    });
  };

  /**
   * ! GPR-385
   * onClick go to TopUpView
   * validate where the events go after TopUpView
   * main page needs to unmount SaleWidget and mount requested Bridge/Swap/OnRamp
   */
  const insufficientCoinsBanner = (
    <Box sx={{ paddingX: 'base.spacing.x2' }}>
      <Banner>
        <Banner.Icon icon="InformationCircle" />
        <Banner.Caption>
          {t('views.PAYMENT_METHODS.insufficientCoinsBanner.caption')}
          <Link
            sx={{ mx: 'base.spacing.x1' }}
            onClick={
              () => onClickInsufficientCoinsBanner()
            }
          >
            {t('views.PAYMENT_METHODS.insufficientCoinsBanner.captionCTA')}
          </Link>
          {t('views.PAYMENT_METHODS.insufficientCoinsBanner.captionEnd')}
        </Banner.Caption>
      </Banner>
    </Box>
  );

  useEffect(() => sendPageView(SaleWidgetViews.PAYMENT_METHODS), []);
  useEffect(() => {
    if (!invalidParameters) return;
    goToErrorView(SaleErrorTypes.INVALID_PARAMETERS);
  }, [invalidParameters]);

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
          {t('views.PAYMENT_METHODS.header.heading')}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <PaymentOptions disabledOptions={disabledPaymentTypes} onClick={handleOptionClick} />
        </Box>
        {viewState.view.data?.showInsufficientCoinsBanner ? insufficientCoinsBanner : null}
      </Box>
    </SimpleLayout>
  );
}

import { Banner, Box, Link } from '@biom3/react';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from 'context/view-context/ViewContext';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ItemType } from '@imtbl/checkout-sdk';
import { useSaleContext } from '../context/SaleContextProvider';
import { SmartCheckoutErrorTypes } from '../types';

export function InsufficientCoinsBanner() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const { smartCheckoutError } = useSaleContext();

  if (
    smartCheckoutError?.data?.error?.message
    !== SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED
  ) {
    return null;
  }

  const onClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.TOP_UP_VIEW,
        },
      },
    });
  };

  const hasEnough = smartCheckoutError?.data?.fractionalBalance || {};

  let label = t('views.PAYMENT_METHODS.insufficientCoinsBanner.caption');

  if (!hasEnough[ItemType.NATIVE] && hasEnough[ItemType.ERC20]) {
    label = t('views.PAYMENT_METHODS.insufficientCoinsBanner.gasCaption');
  }

  return (
    <Box sx={{ paddingX: 'base.spacing.x2' }}>
      <Banner>
        <Banner.Icon icon="InformationCircle" />
        <Banner.Caption>
          {label}
          <Link sx={{ mx: 'base.spacing.x1' }} onClick={() => onClick()}>
            {t('views.PAYMENT_METHODS.insufficientCoinsBanner.captionCTA')}
          </Link>
          {t('views.PAYMENT_METHODS.insufficientCoinsBanner.captionEnd')}
        </Banner.Caption>
      </Banner>
    </Box>
  );
}

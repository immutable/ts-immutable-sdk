import {
  SharedViews,
  ViewActions,
  ViewContext,
} from 'context/view-context/ViewContext';
import { useContext, useEffect } from 'react';
import { ItemType } from '@imtbl/checkout-sdk';
import { useSaleContext } from '../context/SaleContextProvider';
import { SmartCheckoutErrorTypes } from '../types';

export const useInsufficientBalance = () => {
  const { viewDispatch } = useContext(ViewContext);
  const {
    smartCheckoutError,
    fromTokenAddress: tokenAddress,
    amount,
  } = useSaleContext();

  useEffect(() => {
    if (
      smartCheckoutError?.data?.error?.message
      !== SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED
    ) return;

    const transactionRequirements = smartCheckoutError?.data?.transactionRequirements || [];

    const native = transactionRequirements.find(
      ({ type }) => type === ItemType.NATIVE,
    );
    const erc20 = transactionRequirements.find(
      ({ type }) => type === ItemType.ERC20,
    );

    // FIXME: Get token symbols from requirements (ie. erc20.symbol)
    const balances = {
      erc20: {
        value: erc20?.required.formattedBalance,
        symbol: 'USDC',
      },
      native: {
        value: native?.required.formattedBalance,
        symbol: 'IMX',
      },
    };

    const heading = ['views.PAYMENT_METHODS.topUp.heading'];
    let subheading = ['views.PAYMENT_METHODS.topUp.subheading.both', balances];

    if (native?.sufficient && !erc20?.sufficient) {
      subheading = ['views.PAYMENT_METHODS.topUp.subheading.erc20', balances];
    }
    if (!native?.sufficient && erc20?.sufficient) {
      subheading = ['views.PAYMENT_METHODS.topUp.subheading.native', balances];
    }

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.TOP_UP_VIEW,
          data: {
            tokenAddress,
            amount,
            heading,
            subheading,
          },
        },
      },
    });
  }, [smartCheckoutError]);

  return null;
};

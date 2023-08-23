import { Box } from '@biom3/react';

import { useState, useEffect, useContext } from 'react';
import { PaymentOption } from './PaymentOption';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

const defaultPaymentOptions: PrimaryRevenueWidgetViews[] = [
  PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO,
  PrimaryRevenueWidgetViews.PAY_WITH_CARD,
];

export interface PaymentOptionsProps {
  disabledOptions?: PrimaryRevenueWidgetViews[];
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const { disabledOptions = [] } = props;
  const { viewDispatch } = useContext(ViewContext);
  const [options, setOptions] = useState<PrimaryRevenueWidgetViews[]>(
    defaultPaymentOptions,
  );

  useEffect(() => {
    if (disabledOptions.length === 0) return;
    setOptions((prev) => prev.filter((option) => !disabledOptions?.includes(option)));
  }, []);

  const onClick = async (type: PrimaryRevenueWidgetViews) => {
    console.log('clicked', type); // eslint-disable-line no-console

    try {
      switch (type) {
        case PrimaryRevenueWidgetViews.PAY_WITH_CARD:
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: PrimaryRevenueWidgetViews.PAY_WITH_CARD },
            },
          });
          break;
        case PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO:
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO },
            },
          });
          break;
        default:
          break;
      }
    } catch (err: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SharedViews.ERROR_VIEW, error: err },
        },
      });
    }
  };

  return (
    <Box
      testId="wallet-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {options.map((type) => (
        <PaymentOption onClick={onClick} type={type} key={type} />
      ))}
    </Box>
  );
}

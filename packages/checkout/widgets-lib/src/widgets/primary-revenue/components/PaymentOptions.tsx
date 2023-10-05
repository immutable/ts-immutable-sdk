import { Box } from '@biom3/react';

import { useState, useEffect } from 'react';
import { PaymentOption } from './PaymentOption';

import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

const defaultPaymentOptions: PrimaryRevenueWidgetViews[] = [
  PrimaryRevenueWidgetViews.PAY_WITH_CARD,
  PrimaryRevenueWidgetViews.PAY_WITH_COINS,
];

export interface PaymentOptionsProps {
  onClick: (type: PrimaryRevenueWidgetViews) => void;
  disabledOptions?: PrimaryRevenueWidgetViews[];
}

export function PaymentOptions(props: PaymentOptionsProps) {
  const { disabledOptions = [], onClick } = props;

  const [options, setOptions] = useState<PrimaryRevenueWidgetViews[]>(
    defaultPaymentOptions,
  );

  useEffect(() => {
    if (disabledOptions.length === 0) return;
    setOptions((prev) => prev.filter((option) => !disabledOptions?.includes(option)));
  }, []);

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

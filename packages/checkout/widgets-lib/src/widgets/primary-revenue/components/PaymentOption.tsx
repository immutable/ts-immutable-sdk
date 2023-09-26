import { IconProps, MenuItem } from '@biom3/react';

import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

export interface PaymentOptionProps {
  type: PrimaryRevenueWidgetViews;
  onClick: (type: PrimaryRevenueWidgetViews) => void;
}

export function PaymentOption(props: PaymentOptionProps) {
  const { type, onClick } = props;
  const { options } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const optionText = options[type];

  const icon: Record<string, IconProps['icon']> = {
    [PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO]: 'Coins', // FIXME: find icon for bank card
    [PrimaryRevenueWidgetViews.PAY_WITH_CARD]: 'BankCard',
  };

  if (!optionText) return null;

  return (
    <MenuItem
      size="medium"
      emphasized
      onClick={() => onClick(type)}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedIcon icon={icon[type]} />
      <MenuItem.Label size="medium">{optionText.heading}</MenuItem.Label>
      <MenuItem.IntentIcon />
      <MenuItem.Caption>{optionText.caption}</MenuItem.Caption>
    </MenuItem>
  );
}

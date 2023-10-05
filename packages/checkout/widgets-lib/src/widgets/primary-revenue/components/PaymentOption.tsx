import { IconProps, MenuItem } from '@biom3/react';

import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

export interface PaymentOptionProps {
  type: PrimaryRevenueWidgetViews;
  onClick: (type: PrimaryRevenueWidgetViews) => void;
  disabled?: boolean;
}

export function PaymentOption(props: PaymentOptionProps) {
  const { type, onClick, disabled } = props;
  const { options } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const optionText = options[type];

  const icon: Record<string, IconProps['icon']> = {
    [PrimaryRevenueWidgetViews.PAY_WITH_COINS]: 'Coins',
    [PrimaryRevenueWidgetViews.PAY_WITH_CARD]: 'BankCard',
  };

  if (!optionText) return null;

  return (
    <MenuItem
      size="medium"
      emphasized
      onClick={() => onClick(type)}
      sx={{
        marginBottom: 'base.spacing.x1',
        ...(disabled ? { opacity: '0.5' } : {}),
      }}
      disabled={disabled}
    >
      <MenuItem.FramedIcon icon={icon[type]} />
      <MenuItem.Label size="medium">{optionText.heading}</MenuItem.Label>
      {!disabled ? <MenuItem.IntentIcon /> : null}
      <MenuItem.Caption>
        {disabled && optionText.disabledCaption
          ? optionText.disabledCaption
          : optionText.caption}
      </MenuItem.Caption>
    </MenuItem>
  );
}

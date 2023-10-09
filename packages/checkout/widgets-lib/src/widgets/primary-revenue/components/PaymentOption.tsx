import { IconProps, MenuItem } from '@biom3/react';

import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { PaymentTypes } from '../types';

export interface PaymentOptionProps {
  type: PaymentTypes;
  onClick: (type: PaymentTypes) => void;
  disabled?: boolean;
}

export function PaymentOption(props: PaymentOptionProps) {
  const { type, onClick, disabled } = props;
  const { options } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const optionText = options[type];

  const icon: Record<string, IconProps['icon']> = {
    [PaymentTypes.CRYPTO]: 'Coins',
    [PaymentTypes.FIAT]: 'BankCard',
  };

  if (!optionText) return null;

  const handleClick = () => onClick(type);

  return (
    <MenuItem
      size="medium"
      emphasized
      onClick={disabled ? undefined : handleClick}
      sx={{
        marginBottom: 'base.spacing.x1',
      }}
      disabled={disabled}
    >
      <MenuItem.FramedIcon icon={icon[type]} />
      <MenuItem.Label size="medium">{optionText.heading}</MenuItem.Label>
      {!disabled && <MenuItem.IntentIcon />}
      <MenuItem.Caption>
        {disabled && optionText.disabledCaption
          ? optionText.disabledCaption
          : optionText.caption}
      </MenuItem.Caption>
    </MenuItem>
  );
}

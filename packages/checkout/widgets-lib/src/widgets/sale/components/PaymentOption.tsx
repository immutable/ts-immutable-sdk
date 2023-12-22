import { IconProps, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { PaymentTypes } from '../types';

export interface PaymentOptionProps {
  type: PaymentTypes;
  onClick: (type: PaymentTypes) => void;
  disabled?: boolean;
}

export function PaymentOption(props: PaymentOptionProps) {
  const { t } = useTranslation();
  const { type, onClick, disabled } = props;
  // const optionText = options[type];

  const icon: Record<string, IconProps['icon']> = {
    [PaymentTypes.CRYPTO]: 'Coins',
    [PaymentTypes.FIAT]: 'BankCard',
  };

  const handleClick = () => onClick(type);

  return (
    <MenuItem
      size="medium"
      emphasized
      onClick={disabled ? undefined : handleClick}
      sx={{
        ...(disabled && { opacity: '0.5', cursor: 'not-allowed' }),
        marginBottom: 'base.spacing.x1',
      }}
      disabled={disabled}
    >
      <MenuItem.FramedIcon icon={icon[type]} />
      <MenuItem.Label size="medium">{t(`views.PAYMENT_METHODS.options.${type}.heading`)}</MenuItem.Label>
      {!disabled && <MenuItem.IntentIcon />}
      <MenuItem.Caption>
        {t(`views.PAYMENT_METHODS.options.${type}.${disabled ? 'disabledCaption' : 'caption'}`)}
      </MenuItem.Caption>
    </MenuItem>
  );
}

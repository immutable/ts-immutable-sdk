import { IconProps, MenuItem } from '@biom3/react';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface PaymentOptionProps<
  RC extends ReactElement | undefined = undefined,
> {
  type: SalePaymentTypes;
  onClick: (type: SalePaymentTypes) => void;
  disabled?: boolean;
  rc?: RC;
}

export function PaymentOption<RC extends ReactElement | undefined = undefined>({
  type,
  onClick,
  disabled = false,
  rc = <span />,
}: PaymentOptionProps<RC>) {
  const { t } = useTranslation();

  const icon: Record<SalePaymentTypes, IconProps['icon']> = {
    [SalePaymentTypes.CRYPTO]: 'Coins',
    [SalePaymentTypes.DEBIT]: 'BankCard',
    [SalePaymentTypes.CREDIT]: 'BankCard',
  };

  const handleClick = () => onClick(type);

  const menuItemProps = {
    disabled,
    emphasized: true,
    onClick: disabled ? undefined : handleClick,
  };

  return (
    <MenuItem
      rc={rc}
      size="medium"
      sx={{
        marginBottom: 'base.spacing.x1',
        userSelect: 'none',
        ...(disabled && {
          filter: 'opacity(0.5)',
          cursor: 'not-allowed !important',
        }),
      }}
      {...menuItemProps}
    >
      <MenuItem.FramedIcon icon={icon[type]} />
      <MenuItem.Label size="medium">
        {t(`views.PAYMENT_METHODS.options.${type}.heading`)}
      </MenuItem.Label>
      {!disabled && <MenuItem.IntentIcon />}
      <MenuItem.Caption>
        {t(
          `views.PAYMENT_METHODS.options.${type}.${
            disabled ? 'disabledCaption' : 'caption'
          }`,
        )}
      </MenuItem.Caption>
    </MenuItem>
  );
}

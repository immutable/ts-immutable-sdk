import { IconProps, MenuItem, MenuItemSize } from '@biom3/react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export enum CardOptionTypes {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export interface CardOptionProps<RC extends ReactElement | undefined = undefined> {
  rc?: RC;
  type: CardOptionTypes;
  onClick: (type: CardOptionTypes) => void;
  disabled?: boolean;
  caption?: string;
  size?: MenuItemSize;
}

export function CardOption<RC extends ReactElement | undefined = undefined>({
  type,
  onClick,
  disabled = false,
  caption,
  size,
  rc = <span />,
}: CardOptionProps<RC>) {
  const { t } = useTranslation();

  const icon: Record<CardOptionTypes, IconProps['icon']> = {
    [CardOptionTypes.DEBIT]: 'BankCard',
    [CardOptionTypes.CREDIT]: 'BankCard',
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
      size={size || 'medium'}
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
        {t(`views.ADD_FUNDS.drawer.options.${type}.heading`)}
      </MenuItem.Label>
      {!disabled && <MenuItem.IntentIcon />}
      <MenuItem.Caption>
        {caption
          || t(
            `views.ADD_FUNDS.drawer.options.${type}.${
              disabled ? 'disabledCaption' : 'caption'
            }`,
          )}
      </MenuItem.Caption>
    </MenuItem>
  );
}

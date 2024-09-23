import { IconProps, MenuItem, MenuItemSize } from '@biom3/react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CardOptionType, OptionTypes } from '../types';

export interface CardOptionProps<RC extends ReactElement | undefined = undefined> {
  rc?: RC;
  type: OptionTypes;
  onClick: (type: OptionTypes) => void;
  disabled?: boolean;
  size?: MenuItemSize;
}

export function CardOption<RC extends ReactElement | undefined = undefined>({
  type,
  onClick,
  disabled = false,
  size,
  rc = <span />,
}: CardOptionProps<RC>) {
  const { t } = useTranslation();

  const icon: Record<CardOptionType, IconProps['icon']> = {
    [OptionTypes.DEBIT]: 'BankCard',
    [OptionTypes.CREDIT]: 'BankCard',
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
        { t(
          `views.ADD_FUNDS.drawer.options.${type}.${
            disabled ? 'disabledCaption' : 'caption'
          }`,
        )}
      </MenuItem.Caption>
    </MenuItem>
  );
}

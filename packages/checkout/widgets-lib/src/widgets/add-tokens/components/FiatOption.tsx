import { AllDualVariantIconKeys, MenuItem, MenuItemSize } from '@biom3/react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { FiatOptionType } from '../types';

export interface FiatOptionProps<
  RC extends ReactElement | undefined = undefined,
> {
  rc?: RC;
  type: FiatOptionType;
  onClick?: (type: FiatOptionType) => void;
  disabled?: boolean;
  size?: MenuItemSize;
}

export function FiatOption<RC extends ReactElement | undefined = undefined>({
  type,
  onClick,
  disabled = false,
  size = 'small',
  rc = <span />,
}: FiatOptionProps<RC>) {
  const { t } = useTranslation();

  const icon: Record<FiatOptionType, AllDualVariantIconKeys> = {
    [FiatOptionType.DEBIT]: 'BankCard',
    [FiatOptionType.CREDIT]: 'Craft',
  };

  const handleClick = () => {
    onClick?.(type);
  };

  const menuItemProps = {
    disabled,
    emphasized: true,
    onClick: disabled ? undefined : handleClick,
    size,
    rc,
  };

  return (
    <MenuItem {...menuItemProps}>
      <MenuItem.FramedIcon
        icon={icon[type]}
        variant="bold"
        emphasized={false}
      />
      <MenuItem.Label>
        {t(`views.ADD_TOKENS.drawer.options.${type}.heading`)}
      </MenuItem.Label>
      <MenuItem.Caption>
        {t(
          `views.ADD_TOKENS.drawer.options.${type}.${
            disabled ? 'disabledCaption' : 'caption'
          }`,
        )}
      </MenuItem.Caption>
      {!disabled && <MenuItem.IntentIcon />}
    </MenuItem>
  );
}

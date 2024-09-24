import {
  MenuItem, MenuItemSize, Sticker,
} from '@biom3/react';
import { ReactElement } from 'react';
import { Chain, RouteData } from '../types';

export interface RouteOptionProps<RC extends ReactElement | undefined = undefined> {
  route: RouteData;
  chain: Chain | undefined;
  onClick: (route: RouteData) => void;
  disabled?: boolean;
  size?: MenuItemSize;
  rc?: RC;
}

export function RouteOption<RC extends ReactElement | undefined = undefined>({
  route,
  chain,
  onClick,
  disabled = false,
  size,
  rc = <span />,
}: RouteOptionProps<RC>) {
  const handleClick = () => {
    console.log('+++++++ route', route, onClick);
    onClick(route);
  };

  const menuItemProps = {
    disabled,
    emphasized: true,
    onClick: disabled ? undefined : handleClick,
  };

  const { fromToken, balance } = route.amountData;

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
      <MenuItem.Label weight="bold">{fromToken.name}</MenuItem.Label>
      <MenuItem.Caption>
        Balance:
        {' '}
        {balance.balance}

        {fromToken.symbol}
      </MenuItem.Caption>

      {chain && (
      <Sticker position={{ x: 'right', y: 'bottom' }}>
        <Sticker.FramedImage
          use={<img src={chain.iconUrl} alt={chain.name} />}
          sx={{ w: 'base.icon.size.200' }}
        />

        <MenuItem.FramedImage use={<img src={fromToken.logoURI} alt={fromToken.name} />} />
      </Sticker>
      )}

      {!disabled && <MenuItem.IntentIcon />}

    </MenuItem>
  );
}

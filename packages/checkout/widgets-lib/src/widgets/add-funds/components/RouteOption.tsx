import {
  Icon, MenuItem, MenuItemSize, Sticker,
} from '@biom3/react';
import { ReactElement, useMemo } from 'react';
import { ethers } from 'ethers';
import { Chain, RouteData } from '../types';

export interface RouteOptionProps<
  RC extends ReactElement | undefined = undefined,
> {
  route: RouteData;
  onClick: (route: RouteData) => void;
  chain?: Chain;
  usdBalance?: string;
  disabled?: boolean;
  isFastest?: boolean;
  size?: MenuItemSize;
  rc?: RC;
}

export function RouteOption<RC extends ReactElement | undefined = undefined>({
  route,
  onClick,
  chain,
  usdBalance,
  disabled = false,
  isFastest = false,
  size,
  rc = <span />,
}: RouteOptionProps<RC>) {
  const { fromToken } = route.amountData;

  const { estimate } = route.route.route;

  const formattedFromAmount = useMemo(
    () => Number(
      ethers.utils.formatUnits(
        estimate.fromAmount,
        estimate.fromToken.decimals,
      ),
    ).toFixed(4),
    [estimate.fromAmount, estimate.fromToken.decimals],
  );

  const formattedUsdBalance = useMemo(
    () => (usdBalance ? Number(usdBalance).toFixed(2) : undefined),
    [usdBalance],
  );

  const estimatedDurationFormatted = useMemo(() => {
    const seconds = estimate.estimatedRouteDuration;
    if (seconds >= 60) {
      const minutes = Math.round(seconds / 60);
      return minutes === 1 ? '1 min' : `${minutes} mins`;
    }
    return `${seconds.toFixed(0)}s`;
  }, [estimate.estimatedRouteDuration]);

  const handleClick = () => {
    onClick(route);
  };

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
      <MenuItem.Label weight="bold">{fromToken.name}</MenuItem.Label>

      {formattedUsdBalance && (
        <MenuItem.Caption>
          {`Balance: $${formattedUsdBalance}`}
        </MenuItem.Caption>
      )}

      {chain && (
        <Sticker position={{ x: 'right', y: 'bottom' }}>
          <Sticker.FramedImage
            use={<img src={chain.iconUrl} alt={chain.name} />}
            sx={{ w: 'base.icon.size.200' }}
          />

          <MenuItem.FramedImage
            use={<img src={fromToken.iconUrl} alt={fromToken.name} />}
          />
        </Sticker>
      )}

      {formattedFromAmount && estimate.fromAmountUSD && (
        <MenuItem.PriceDisplay price={formattedFromAmount}>
          <MenuItem.PriceDisplay.Caption>
            {`USD $${estimate.fromAmountUSD}`}
          </MenuItem.PriceDisplay.Caption>
        </MenuItem.PriceDisplay>
      )}

      {isFastest && (
        <MenuItem.Badge badgeContent="Fastest" variant="emphasis" />
      )}

      <MenuItem.Caption>
        <Icon icon="Countdown" sx={{ w: 'base.icon.size.250' }} />
        {' '}
        {estimatedDurationFormatted}
      </MenuItem.Caption>
    </MenuItem>
  );
}

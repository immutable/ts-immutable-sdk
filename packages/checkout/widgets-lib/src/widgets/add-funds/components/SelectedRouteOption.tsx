import {
  MenuItem, MenuItemSize, Sticker, SxProps,
} from '@biom3/react';
import { ReactElement, useMemo } from 'react';
import { TokenBalance } from '@0xsquid/sdk/dist/types';

import { Chain, RouteData } from '../types';
import { getUsdBalance } from '../functions/convertTokenBalanceToUsd';

export interface RouteOptionProps<
  RC extends ReactElement | undefined = undefined,
> {
  size?: MenuItemSize;
  rc?: RC;
  onClick: () => void;
  routeData?: RouteData;
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  disabled?: boolean;
  isFastest?: boolean;
  emphasized?: boolean;
  selected?: boolean;
  loading?: boolean;
  sx?: SxProps;
}

export function SelectedRouteOption<
  RC extends ReactElement | undefined = undefined,
>({
  routeData,
  chains,
  balances,
  loading = false,
  onClick,
  size,
  rc = <span />,
  sx,
}: RouteOptionProps<RC>) {
  if (!routeData && !loading) {
    return (
      <MenuItem
        size="small"
        sx={{
          ml: '-76px',
          w: 'calc(100% + 88px)',
        }}
      >
        <MenuItem.FramedIcon icon="Dollar" circularFrame padded />
        <MenuItem.Caption>
          Add your token, we&apos;ll find the best payment
        </MenuItem.Caption>
      </MenuItem>
    );
  }

  if (!routeData || loading) {
    return (
      <MenuItem
        size="small"
        sx={{
          ml: '-76px',
          w: 'calc(100% + 88px)',
        }}
      >
        <MenuItem.FramedVideo
          videoUrl="https://i.imgur.com/dVQoobw.mp4"
          mimeType="video/mp4"
          circularFrame
          padded
        />
        <MenuItem.Caption>Finding the best payment route...</MenuItem.Caption>
      </MenuItem>
    );
  }

  const { fromToken } = routeData.amountData;

  const chain = chains?.find((c) => c.id === fromToken.chainId);
  const balance = balances?.find(
    ({ address, chainId }) => address === fromToken.address && chainId === fromToken.chainId,
  );

  const usdBalance = getUsdBalance(balance, routeData);
  const formattedUsdBalance = useMemo(
    () => (usdBalance ? Number(usdBalance).toFixed(2) : undefined),
    [usdBalance],
  );

  const menuItemProps = { onClick };

  return (
    <MenuItem
      rc={rc}
      size={size || 'medium'}
      sx={{
        ...sx,
        py: '0 !important',
        ml: '-77px',
        my: '1px',
        w: 'calc(100% + 90px)',
        userSelect: 'none',
        brad: '0',
      }}
      {...menuItemProps}
    >
      <MenuItem.Label weight="bold">{fromToken.name}</MenuItem.Label>

      {chain && (
        <Sticker position={{ x: 'right', y: 'bottom' }}>
          <Sticker.FramedImage
            use={<img src={chain.iconUrl} alt={chain.name} />}
            sx={{ w: 'base.icon.size.200' }}
          />

          <MenuItem.FramedImage
            circularFrame
            use={(
              <img
                data-id="token-icon"
                src={fromToken.iconUrl}
                alt={fromToken.name}
              />
            )}
          />
        </Sticker>
      )}

      <MenuItem.Caption>{`Balance $${formattedUsdBalance}`}</MenuItem.Caption>
    </MenuItem>
  );
}

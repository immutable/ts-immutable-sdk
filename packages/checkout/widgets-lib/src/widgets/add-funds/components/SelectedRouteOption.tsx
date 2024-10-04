import {
  Box,
  hFlex,
  MenuItem, MenuItemSize, Stack, Sticker, SxProps,
} from '@biom3/react';
import { MouseEvent, MouseEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { TokenBalance } from '@0xsquid/sdk/dist/types';

import { Chain, RouteData } from '../types';
import { getUsdBalance } from '../functions/convertTokenBalanceToUsd';

export interface RouteOptionProps {
  size?: MenuItemSize;
  onClick: MouseEventHandler<HTMLSpanElement>;
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

function SelectedRouteOptionContainer({ children, onClick }: { children: ReactNode; onClick?: MouseEventHandler<HTMLSpanElement> }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="base.spacing.x4"
      sx={{ 
        ml: '-77px', 
        px: 'base.spacing.x3' 
      }} 
      rc={<span {...(onClick ? { onClick } : {})} />}
    >
      {children}
    </Stack>
  );
}

export function SelectedRouteOption({
  routeData,
  chains,
  balances,
  loading = false,
  onClick,
  size,
  sx,
}: RouteOptionProps) {
  const mergedOnClick = useCallback((event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (!loading && !routeData) return false;
    onClick?.(event);
  }, [onClick, loading, routeData]);
  const { fromToken } = routeData?.amountData ?? {};
  const chain = chains?.find((c) => c.id === fromToken?.chainId);
  const balance = balances?.find(
    ({ address, chainId }) => address === fromToken?.address && chainId === fromToken.chainId,
  );
  const usdBalance = routeData ? getUsdBalance(balance, routeData) : '';
  const formattedUsdBalance = useMemo(
    () => (usdBalance ? Number(usdBalance).toFixed(2) : undefined),
    [usdBalance],
  );

  if (!routeData) {
    return loading ? (
      <SelectedRouteOptionContainer onClick={mergedOnClick}>
        <MenuItem.FramedVideo
          videoUrl="https://i.imgur.com/dVQoobw.mp4"
          mimeType="video/mp4"
          circularFrame
          padded
        />
        <MenuItem.Caption>Finding the best payment route...</MenuItem.Caption>
      </SelectedRouteOptionContainer>
    ) : (
      <SelectedRouteOptionContainer onClick={mergedOnClick}>
        <MenuItem.FramedIcon icon="Sparkle" variant="bold" circularFrame emphasized={false} />
         <MenuItem.Caption>
           Add your token, we&apos;ll find the best payment
         </MenuItem.Caption>
      </SelectedRouteOptionContainer>
    )
  }

  return (
    <SelectedRouteOptionContainer onClick={mergedOnClick}>
      <MenuItem.Label weight="bold">{fromToken?.name}</MenuItem.Label>
      {chain && (
        <Sticker position={{ x: 'right', y: 'bottom' }}>
          <Sticker.FramedImage
            use={<img src={chain.iconUrl} alt={chain.name} />}
            sx={{ w: 'base.icon.size.200' }}
          />

          <MenuItem.FramedImage
            circularFrame
            use={(
              <img src={fromToken?.iconUrl} alt={fromToken?.name} />
            )}
          />
        </Sticker>
      )}
      <MenuItem.Caption>{`Balance $${formattedUsdBalance}`}</MenuItem.Caption>
    </SelectedRouteOptionContainer>
  );
}

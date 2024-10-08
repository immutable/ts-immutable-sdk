import { MenuItem, Stack, Sticker } from '@biom3/react';
import { BigNumber, utils } from 'ethers';
import {
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { TokenBalance } from '@0xsquid/sdk/dist/types';

import { Chain, RouteData } from '../types';
import { getUsdBalance } from '../functions/convertTokenBalanceToUsd';
import { tokenValueFormat } from '../../../lib/utils';

export interface RouteOptionProps {
  routeData?: RouteData;
  chains: Chain[] | null;
  onClick: MouseEventHandler<HTMLSpanElement>;
  balances: TokenBalance[] | null;
  loading?: boolean;
  selected?: boolean;
}

function SelectedRouteOptionContainer({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="base.spacing.x4"
      sx={{
        ml: ({ base }) => (selected
          ? `calc(${base.spacing.x12} * -1)`
          : `calc(${base.spacing.x16} * -1)`),
        w: ({ base }) => (selected
          ? `calc(100% + (${base.spacing.x12}))`
          : `calc(100% + (${base.spacing.x16}))`),
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
  selected = false,
  onClick,
}: RouteOptionProps) {
  const mergedOnClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      if (!loading && !routeData) return false;
      onClick?.(event);
      return true;
    },
    [onClick, loading, routeData],
  );
  const { fromToken } = routeData?.amountData ?? {};
  const chain = chains?.find((c) => c.id === fromToken?.chainId);
  const balance = balances?.find(
    ({ address, chainId }) => address === fromToken?.address && chainId === fromToken.chainId,
  );

  const usdBalance = routeData ? getUsdBalance(balance, routeData) : '0.00';

  const routeUSDBalance = routeData?.route.route.estimate.fromAmountUSD ?? '0.00';
  const routeBalance = useMemo(() => {
    if (!routeData) return '0.00';

    const amount = routeData?.route.route.estimate.fromAmount;
    const decimals = routeData?.route.route.estimate.fromToken.decimals;

    return utils.formatUnits(BigNumber.from(amount), decimals).toString();
  }, [routeData]);

  if (!routeData) {
    return loading ? (
      <SelectedRouteOptionContainer onClick={mergedOnClick} selected={selected}>
        <MenuItem.FramedVideo
          videoUrl="https://i.imgur.com/dVQoobw.mp4"
          mimeType="video/mp4"
          circularFrame
          padded
        />
        <MenuItem.Caption>Finding the best payment route...</MenuItem.Caption>
      </SelectedRouteOptionContainer>
    ) : (
      <SelectedRouteOptionContainer onClick={mergedOnClick} selected={selected}>
        <MenuItem.FramedIcon
          icon="Sparkle"
          variant="bold"
          circularFrame
          emphasized={false}
        />
        <MenuItem.Caption>
          Add your token, we&apos;ll find the best payment
        </MenuItem.Caption>
      </SelectedRouteOptionContainer>
    );
  }

  return (
    <SelectedRouteOptionContainer onClick={mergedOnClick} selected={selected}>
      {chain && (
        <Sticker position={{ x: 'right', y: 'bottom' }}>
          <Sticker.FramedImage
            use={<img src={chain.iconUrl} alt={chain.name} />}
            sx={{ w: 'base.icon.size.200' }}
          />

          <MenuItem.FramedImage
            circularFrame
            padded
            use={<img src={fromToken?.iconUrl} alt={fromToken?.name} />}
          />
        </Sticker>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ w: '100%' }}
      >
        <Stack gap="0px">
          <MenuItem.Label>{fromToken?.name}</MenuItem.Label>
          <MenuItem.Caption>
            {`Balance USD $${tokenValueFormat(usdBalance)}`}
          </MenuItem.Caption>
        </Stack>
        <MenuItem.PriceDisplay price={tokenValueFormat(routeBalance)}>
          <MenuItem.PriceDisplay.Caption>
            {`USD $${tokenValueFormat(routeUSDBalance)}`}
          </MenuItem.PriceDisplay.Caption>
        </MenuItem.PriceDisplay>
      </Stack>
    </SelectedRouteOptionContainer>
  );
}

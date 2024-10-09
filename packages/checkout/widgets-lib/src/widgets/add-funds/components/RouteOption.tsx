import {
  Badge,
  Body,
  centerFlexChildren,
  hFlex,
  Icon,
  MenuItem,
  MenuItemSize,
  Stack,
  Sticker,
} from '@biom3/react';
import { ReactElement, useMemo } from 'react';
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
  selected?: boolean;
}

export function RouteOption<RC extends ReactElement | undefined = undefined>({
  route,
  onClick,
  chain,
  usdBalance,
  disabled = false,
  isFastest = false,
  size = 'small',
  rc = <span />,
  selected = false,
}: RouteOptionProps<RC>) {
  const { fromToken } = route.amountData;
  const { estimate } = route.route.route;

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
    selected,
    disabled,
    emphasized: true,
    rc,
    size,
    onClick: disabled ? undefined : handleClick,
  };

  return (
    <MenuItem {...menuItemProps}>
      <MenuItem.Label>{fromToken.name}</MenuItem.Label>

      {chain && (
        <Sticker position={{ x: 'right', y: 'bottom' }}>
          <Sticker.FramedImage
            use={<img src={chain.iconUrl} alt={chain.name} />}
            size="xSmall"
          />

          <MenuItem.FramedImage
            circularFrame
            padded
            use={<img src={fromToken.iconUrl} alt={fromToken.name} />}
          />
        </Sticker>
      )}

      <MenuItem.Caption>
        Balance: $
        {formattedUsdBalance}
      </MenuItem.Caption>

      <MenuItem.BottomSlot>
        <MenuItem.BottomSlot.Divider />
        <Stack
          rc={<span />}
          direction="row"
          justifyContent="space-between"
          sx={{
            w: '100%',
          }}
        >
          <Body
            sx={{
              ...hFlex,
              ...centerFlexChildren,
              gap: 'base.spacing.x1',
              c: 'base.color.text.body.secondary',
            }}
            size="xSmall"
          >
            <Icon
              icon="Countdown"
              sx={{
                w: 'base.icon.size.200',
                fill: 'base.color.text.body.secondary',
              }}
              variant="bold"
            />
            {estimatedDurationFormatted}
          </Body>

          {isFastest && <Badge badgeContent="Fastest" variant="emphasis" />}
        </Stack>
      </MenuItem.BottomSlot>
    </MenuItem>
  );
}

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
import { useTranslation } from 'react-i18next';
import { getRouteAndTokenBalances } from '../../../../lib/squid/functions/getRouteAndTokenBalances';
import { getTotalRouteFees } from '../../../../lib/squid/functions/getTotalRouteFees';
import { Chain, RouteData } from '../../../../lib/squid/types';
import { getDurationFormatted } from '../../../../functions/getDurationFormatted';
import { getFormattedAmounts } from '../../../../functions/getFormattedNumber';

export interface RouteOptionProps<
  RC extends ReactElement | undefined = undefined,
> {
  routeData: RouteData;
  chains: Chain[] | null;
  onClick: (route: RouteData) => void;
  disabled?: boolean;
  isFastest?: boolean;
  size?: MenuItemSize;
  rc?: RC;
  selected?: boolean;
}

export function RouteOption<RC extends ReactElement | undefined = undefined>({
  routeData,
  onClick,
  chains,
  disabled = false,
  isFastest = false,
  size = 'small',
  rc = <span />,
  selected = false,
}: RouteOptionProps<RC>) {
  const { t } = useTranslation();

  const { fromToken } = routeData.amountData;
  const { estimate } = routeData.route.route;

  const chain = chains?.find((c) => c.id === fromToken.chainId);

  const estimatedDurationFormatted = getDurationFormatted(
    estimate.estimatedRouteDuration,
    t('views.PURCHASE.routeSelection.minutesText'),
    t('views.PURCHASE.routeSelection.minuteText'),
    t('views.PURCHASE.routeSelection.secondsText'),
  );

  const { totalFeesUsd } = useMemo(
    () => getTotalRouteFees(routeData.route),
    [routeData],
  );

  const { routeBalanceUsd, fromAmount, fromAmountUsd } = useMemo(
    () => getRouteAndTokenBalances(routeData),
    [routeData],
  );

  const handleClick = () => {
    onClick(routeData);
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
            use={<img src={fromToken.iconUrl} alt={fromToken.name} />}
          />
        </Sticker>
      )}

      <MenuItem.Caption>
        {`${t('views.PURCHASE.fees.balance')} ${t('views.PURCHASE.fees.fiatPricePrefix')} $${routeBalanceUsd}`}
        {routeData.isInsufficientGas && (
        <>
          <br />
          <span style={{ color: '#FF637F' }}>
            {t('views.PURCHASE.noGasRouteMessage', {
              token:
              routeData.route.route.estimate.gasCosts[0].token.symbol,
            })}
          </span>
        </>
        )}
      </MenuItem.Caption>

      <MenuItem.PriceDisplay price={fromAmount}>
        <MenuItem.PriceDisplay.Caption>
          {`${t('views.PURCHASE.fees.fiatPricePrefix')} $${fromAmountUsd}`}
        </MenuItem.PriceDisplay.Caption>
      </MenuItem.PriceDisplay>

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

          <Body size="xSmall" sx={{ ...hFlex, ...centerFlexChildren }}>
            {isFastest && (
              <Badge
                badgeContent={t('views.PURCHASE.routeSelection.fastestBadge')}
                variant="emphasis"
                sx={{ mr: 'base.spacing.x2' }}
              />
            )}
            {
              `${t('views.PURCHASE.fees.fee')} ${t('views.PURCHASE.fees.fiatPricePrefix')} 
              $${getFormattedAmounts(totalFeesUsd)}`
            }
          </Body>
        </Stack>
      </MenuItem.BottomSlot>
    </MenuItem>
  );
}

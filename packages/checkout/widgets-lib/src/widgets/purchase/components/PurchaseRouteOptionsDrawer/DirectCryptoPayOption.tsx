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
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Chain } from '../../../../lib/squid/types';
import { getDurationFormatted } from '../../../../functions/getDurationFormatted';
import { getFormattedAmounts } from '../../../../functions/getFormattedNumber';
import { DirectCryptoPayData } from '../../types';
import { getRouteAndTokenBalancesForDirectCryptoPay } from '../../functions/getRouteAndBalancesForDirectCryptoPay';

export interface DirectCryptoPayOptionProps<
    RC extends ReactElement | undefined = undefined,
  > {
  routeData: DirectCryptoPayData;
  chains: Chain[] | null;
  onClick: (route: DirectCryptoPayData) => void;
  disabled?: boolean;
  isFastest?: boolean;
  size?: MenuItemSize;
  rc?: RC;
  selected?: boolean;
}

export function DirectCryptoPayOption<RC extends ReactElement | undefined = undefined>({
  routeData,
  onClick,
  chains,
  disabled = false,
  isFastest = false,
  size = 'small',
  rc = <span />,
  selected = false,
}: DirectCryptoPayOptionProps<RC>) {
  const { t } = useTranslation();
  const { fromToken } = routeData.amountData;
  const estimate = 0;
  const gasTokenSymbol = 'IMX';
  const totalFeesUsd = 0;

  const chain = chains?.find((c) => c.id === fromToken.chainId);

  const estimatedDurationFormatted = getDurationFormatted(
    estimate,
    t('views.PURCHASE.routeSelection.minutesText'),
    t('views.PURCHASE.routeSelection.minuteText'),
    t('views.PURCHASE.routeSelection.secondsText'),
  );

  const {
    routeBalanceUsd,
  } = getRouteAndTokenBalancesForDirectCryptoPay(routeData);

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
        {`${t('views.PURCHASE.fees.balance')} ${t('views.PURCHASE.fees.fiatPricePrefix')}${routeBalanceUsd}`}
        {routeData.isInsufficientGas && (
          <>
            <br />
            <span style={{ color: '#FF637F' }}>
              {t('views.PURCHASE.noGasRouteMessage', {
                token: gasTokenSymbol,
              })}
            </span>
          </>
        )}
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
            {' '}
            |
            {' '}
            {
              `${t('views.PURCHASE.fees.fee')} 
              ${t('views.PURCHASE.fees.fiatPricePrefix')}${getFormattedAmounts(totalFeesUsd)}`
            }
          </Body>

          <Body size="xSmall" sx={{ ...hFlex, ...centerFlexChildren }}>
            {isFastest && (
            <Badge
              badgeContent={t('views.PURCHASE.routeSelection.fastestBadge')}
              variant="emphasis"
              sx={{ mr: 'base.spacing.x2' }}
            />
            )}
          </Body>
        </Stack>
      </MenuItem.BottomSlot>
    </MenuItem>
  );
}

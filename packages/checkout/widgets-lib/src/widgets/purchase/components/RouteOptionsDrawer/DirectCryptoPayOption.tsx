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
import { getFormattedAmounts, getFormattedNumber } from '../../../../functions/getFormattedNumber';
import { DirectCryptoPayData } from '../../types';

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

  console.log('routeData', routeData);
  const { fromToken } = routeData.amountData;
  const estimate = 0;
  const gasTokenSymbol = 'IMX';
  const totalFeesUsd = 0;

  const { usdPrice } = routeData.amountData.fromToken;

  const routeBalance = getFormattedNumber(
    routeData.amountData.balance.balance,
    routeData.amountData.balance.decimals,
    routeData.amountData.balance.decimals, // preserve precision for usd conversion down below
  );
  const routeBalanceUsd = (parseFloat(routeBalance) * usdPrice).toString();

  const { fromAmount } = routeData.amountData;
  const fromAmountUsd = (parseFloat(fromAmount) * usdPrice).toString();

  const chain = chains?.find((c) => c.id === fromToken.chainId);
  console.log('chains', chains);
  console.log('chain', chain);
  console.log('fromToken', fromToken);
  console.log('usdPrice', usdPrice);
  console.log('fromAmount', fromAmount);
  console.log('fromAmountUsd', fromAmountUsd);
  const estimatedDurationFormatted = getDurationFormatted(
    estimate,
    t('views.ADD_TOKENS.routeSelection.minutesText'),
    t('views.ADD_TOKENS.routeSelection.minuteText'),
    t('views.ADD_TOKENS.routeSelection.secondsText'),
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
        {`${t('views.ADD_TOKENS.fees.balance')} ${t('views.ADD_TOKENS.fees.fiatPricePrefix')} $${routeBalanceUsd}`}
        {routeData.isInsufficientGas && (
          <>
            <br />
            <span style={{ color: '#FF637F' }}>
              {t('views.ADD_TOKENS.noGasRouteMessage', {
                token: gasTokenSymbol,
              })}
            </span>
          </>
        )}
      </MenuItem.Caption>

      <MenuItem.PriceDisplay price={fromAmount}>
        <MenuItem.PriceDisplay.Caption>
          {`${t('views.ADD_TOKENS.fees.fiatPricePrefix')} $${fromAmountUsd}`}
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
              badgeContent={t('views.ADD_TOKENS.routeSelection.fastestBadge')}
              variant="emphasis"
              sx={{ mr: 'base.spacing.x2' }}
            />
            )}
            {
                `${t('views.ADD_TOKENS.fees.fee')} ${t('views.ADD_TOKENS.fees.fiatPricePrefix')} 
                $${getFormattedAmounts(totalFeesUsd)}`
              }
          </Body>
        </Stack>
      </MenuItem.BottomSlot>
    </MenuItem>
  );
}

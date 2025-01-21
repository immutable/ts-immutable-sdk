import {
  AllDualVariantIconKeys,
  MenuItem,
  Stack,
  Sticker,
  Tooltip,
} from '@biom3/react';
import {
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

import { Checkout } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { getRouteAndTokenBalances } from '../../../../lib/squid/functions/getRouteAndTokenBalances';
import { Chain, RouteData } from '../../../../lib/squid/types';
import { getRemoteVideo } from '../../../../lib/utils';
import { DirectCryptoPayData } from '../../types';
import { getRouteAndTokenBalancesForDirectCryptoPay } from '../../functions/getRouteAndBalancesForDirectCryptoPay';

export interface SelectedRouteOptionProps {
  checkout: Checkout;
  routeData?: RouteData | DirectCryptoPayData;
  chains: Chain[] | null;
  onClick: MouseEventHandler<HTMLSpanElement>;
  loading?: boolean;
  withSelectedWallet?: boolean;
  insufficientBalance?: boolean;
  directCryptoPay?: boolean;
  showOnrampOption?: boolean;
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
  checkout,
  routeData,
  chains,
  loading = false,
  withSelectedWallet = false,
  insufficientBalance = false,
  directCryptoPay = false,
  showOnrampOption = false,
  onClick,
}: SelectedRouteOptionProps) {
  const { t } = useTranslation();

  const { fromToken } = routeData?.amountData ?? {};
  const chain = chains?.find((c) => c.id === fromToken?.chainId);

  let chainNativeCurrencySymbol = '';
  const { routeBalanceUsd, fromAmount, fromAmountUsd } = useMemo(
    () => {
      if (!routeData || !('route' in routeData)) {
        if (directCryptoPay) {
          chainNativeCurrencySymbol = chain?.nativeCurrency.symbol || '';
          return getRouteAndTokenBalancesForDirectCryptoPay(routeData);
        }
        return { routeBalanceUsd: '0', fromAmount: '0', fromAmountUsd: '0' };
      }
      chainNativeCurrencySymbol = routeData.route.route.estimate.gasCosts[0].token.symbol;
      return getRouteAndTokenBalances(routeData);
    },
    [routeData],
  );

  const insufficientBalancePayWithCard = insufficientBalance && showOnrampOption;

  const handleOnClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();

      if (!loading && !routeData && !insufficientBalancePayWithCard) return false;

      onClick?.(event);
      return true;
    },
    [onClick, loading, routeData],
  );

  if (!routeData && loading) {
    return (
      <SelectedRouteOptionContainer
        onClick={handleOnClick}
        selected={withSelectedWallet}
      >
        <MenuItem.FramedVideo
          videoUrl={getRemoteVideo(
            checkout.config.environment,
            '/loading_bubble-small.mp4',
          )}
          padded
          mimeType="video/mp4"
          circularFrame
        />
        <MenuItem.Caption>{t('views.PURCHASE.routeSelection.loadingText')}</MenuItem.Caption>
      </SelectedRouteOptionContainer>
    );
  }

  if ((!routeData && !loading) || insufficientBalance) {
    let icon: AllDualVariantIconKeys = 'Sparkle';
    let copy = '';

    if (insufficientBalance) {
      icon = 'InformationCircle';
      copy = t('views.PURCHASE.routeSelection.noRoute');
    }

    if (insufficientBalancePayWithCard) {
      icon = 'BankCard';
      copy = t('views.PURCHASE.routeSelection.payWithCard');
    }

    return (
      <SelectedRouteOptionContainer
        onClick={handleOnClick}
        selected={withSelectedWallet}
      >
        <MenuItem.FramedIcon
          icon={icon}
          variant="bold"
          circularFrame
          emphasized={false}
        />
        <MenuItem.Caption>{copy}</MenuItem.Caption>
      </SelectedRouteOptionContainer>
    );
  }

  return (
    <SelectedRouteOptionContainer
      onClick={handleOnClick}
      selected={withSelectedWallet}
    >
      {chain && (
        <Sticker position={{ x: 'rightInside', y: 'bottomInside' }}>
          <Tooltip size="small">
            <Tooltip.Target>
              <Sticker.FramedImage
                use={<img src={chain.iconUrl} alt={chain.name} />}
                size="xSmall"
              />
            </Tooltip.Target>
            <Tooltip.Content id="route_tooltip_content">
              {chain.name}
            </Tooltip.Content>
          </Tooltip>

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
            {`${t('views.PURCHASE.fees.balance')} ${t(
              'views.PURCHASE.fees.fiatPricePrefix',
            )} $${routeBalanceUsd}`}
            {routeData?.isInsufficientGas && (
            <>
              <br />
              <span style={{ color: '#FF637F' }}>
                {t('views.PURCHASE.noGasRouteMessage', {
                  token: chainNativeCurrencySymbol,
                })}
              </span>
            </>
            )}
          </MenuItem.Caption>
        </Stack>
        <MenuItem.PriceDisplay price={fromAmount}>
          <MenuItem.PriceDisplay.Caption>
            {`${t('views.PURCHASE.fees.fiatPricePrefix')} $${fromAmountUsd}`}
          </MenuItem.PriceDisplay.Caption>
        </MenuItem.PriceDisplay>
      </Stack>
    </SelectedRouteOptionContainer>
  );
}
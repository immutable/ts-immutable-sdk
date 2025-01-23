import {
  AllDualVariantIconKeys,
  MenuItem,
  Sticker,
} from '@biom3/react';
import {
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useMemo,
} from 'react';

import { Checkout } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { getRouteAndTokenBalances } from '../../../lib/squid/functions/getRouteAndTokenBalances';
import { Chain, RouteData } from '../../../lib/squid/types';
import { getRemoteVideo } from '../../../lib/utils';
import { getRouteAndTokenBalancesForDirectCryptoPay } from '../functions/getRouteAndBalancesForDirectCryptoPay';
import { DirectCryptoPayData } from '../types';

interface PurchaseSelectedRouteOptionProps {
  checkout: Checkout;
  routeData?: RouteData | DirectCryptoPayData;
  chains: Chain[] | null;
  onClick: MouseEventHandler<HTMLSpanElement>;
  loading?: boolean;
  insufficientBalance?: boolean;
  directCryptoPay?: boolean;
  showOnrampOption?: boolean;
}

export function PurchaseSelectedRouteOption({
  checkout,
  routeData,
  chains,
  loading = false,
  insufficientBalance = false,
  directCryptoPay = false,
  showOnrampOption = false,
  onClick,
}: PurchaseSelectedRouteOptionProps) {
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
      <MenuItem
        size="small"
        emphasized
        sx={{
          cursor: 'pointer',
          py: 'base.spacing.x4',
        }}
        onClick={handleOnClick}
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
      </MenuItem>
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
      <MenuItem
        size="small"
        emphasized
        sx={{
          cursor: 'pointer',
          py: 'base.spacing.x4',
        }}
        onClick={handleOnClick}
        // selected={withSelectedWallet}
      >
        <MenuItem.FramedIcon
          icon={icon}
          variant="bold"
          circularFrame
          emphasized={false}
        />
        <MenuItem.Caption>{copy}</MenuItem.Caption>
      </MenuItem>
    );
  }

  return (
    <MenuItem
      size="small"
      emphasized
      sx={{
        cursor: 'pointer',
        py: 'base.spacing.x4',
      }}
      onClick={handleOnClick}
    >

      {chain && (
      <Sticker position={{ x: 'rightInside', y: 'bottomInside' }}>
        <Sticker.FramedImage
          use={<img src={chain.iconUrl} alt={chain.name} />}
          size="xSmall"
        />

        <MenuItem.FramedImage
          circularFrame
          sx={{ w: '48px', h: '48px' }}
          use={<img src={fromToken?.iconUrl} alt={fromToken?.name} />}
        />
      </Sticker>
      )}

      <MenuItem.Label>
        {t('views.PURCHASE.walletSelection.from.label')}
        {' '}
        {fromToken?.name}
      </MenuItem.Label>
      <MenuItem.Caption>
        {`${t('views.PURCHASE.fees.balance')} ${t(
          'views.PURCHASE.fees.fiatPricePrefix',
        )}${routeBalanceUsd}`}
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
      <MenuItem.PriceDisplay price={fromAmount}>
        <MenuItem.PriceDisplay.Caption>
          {`${t('views.PURCHASE.fees.fiatPricePrefix')} $${fromAmountUsd}`}
        </MenuItem.PriceDisplay.Caption>
      </MenuItem.PriceDisplay>
    </MenuItem>
  );
}

import { Box, ButtCon, MenuItem } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { IMTBLWidgetEvents, WidgetTheme } from '@imtbl/checkout-sdk';
import { fetchTokenSymbols } from '../../../lib/fetchTokenSymbols';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { ButtonNavigationStyles } from '../../../components/Header/HeaderStyles';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { TotalTokenBalance } from '../components/TotalTokenBalance/TotalTokenBalance';
import { TokenBalanceList } from '../components/TokenBalanceList/TokenBalanceList';
import { NetworkMenu } from '../components/NetworkMenu/NetworkMenu';
import { WalletContext } from '../context/WalletContext';
import { sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import {
  walletBalanceOuterContainerStyles,
  walletBalanceContainerStyles,
  walletBalanceLoadingIconStyles,
  walletBalanceListContainerStyles,
} from './WalletBalancesStyles';
import { getL2ChainId } from '../../../lib/networkUtils';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { BalanceInfo, mapTokenBalancesWithConversions } from '../functions/tokenBalances';
import { isPassportProvider } from '../../../lib/provider';

type WalletBalancesProps = {
  balancesLoading: boolean;
  theme: WidgetTheme;
  showNetworkMenu: boolean;
};
export function WalletBalances({
  balancesLoading,
  theme,
  showNetworkMenu,
}: WalletBalancesProps) {
  const { t } = useTranslation();
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { walletState } = useContext(WalletContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { viewDispatch } = useContext(ViewContext);
  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const {
    network,
    supportedTopUps,
    tokenBalances,
  } = walletState;
  const { conversions } = cryptoFiatState;
  const isPassport = isPassportProvider(provider);
  const enableNetworkMenu = !isPassport && showNetworkMenu;

  const { track, page } = useAnalytics();

  const balanceInfos: BalanceInfo[] = useMemo(
    () => {
      if (!network?.chainId) return [];

      return mapTokenBalancesWithConversions(Number(network.chainId), tokenBalances, conversions);
    },
    [tokenBalances, conversions, network?.chainId],
  );

  useEffect(() => {
    page({
      userJourney: UserJourney.WALLET,
      screen: 'WalletBalances',
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!checkout) return;
      if (!cryptoFiatDispatch) return;
      if (!network) return;

      const tokenSymbols = await fetchTokenSymbols(checkout, Number(network.chainId));

      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
          tokenSymbols,
        },
      });
    })();
  }, [checkout, cryptoFiatDispatch, network?.chainId]);

  useEffect(() => {
    let totalAmount = 0.0;

    balanceInfos.forEach((balance) => {
      const fiatAmount = parseFloat(balance.fiatAmount);
      if (!Number.isNaN(fiatAmount)) totalAmount += fiatAmount;
    });

    setTotalFiatAmount(totalAmount);
  }, [balanceInfos]);

  const showAddCoins = useMemo(() => {
    if (!checkout || !network) return false;
    return (
      Number(network.chainId) === getL2ChainId(checkout.config)
      && Boolean(
        supportedTopUps?.isBridgeEnabled
        || supportedTopUps?.isSwapEnabled
        || supportedTopUps?.isOnRampEnabled,
      )
    );
  }, [checkout, network, supportedTopUps]);

  const handleAddCoinsClick = () => {
    track({
      userJourney: UserJourney.WALLET,
      screen: 'WalletBalances',
      control: 'AddCoins',
      controlType: 'Button',
    });
    orchestrationEvents.sendRequestAddTokensEvent(eventTarget, IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {});
  };

  const handleBridgeToL2OnClick = (address?: string) => {
    orchestrationEvents.sendRequestBridgeEvent(eventTarget, IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
      tokenAddress: address ?? '',
      amount: '',
    });
  };

  return (
    <SimpleLayout
      testId="wallet-balances"
      header={(
        <HeaderNavigation
          title={t('views.WALLET_BALANCES.header.title')}
          rightActions={(
            <ButtCon
              icon="SettingsCog"
              sx={ButtonNavigationStyles()}
              iconVariant="bold"
              onClick={() => {
                track({
                  userJourney: UserJourney.WALLET,
                  screen: 'WalletBalances',
                  control: 'Settings',
                  controlType: 'Button',
                });
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: WalletWidgetViews.SETTINGS },
                  },
                });
              }}
              testId="settings-button"
            />
          )}
          onCloseButtonClick={() => sendWalletWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={walletBalanceOuterContainerStyles}
      >
        <Box sx={walletBalanceContainerStyles}>
          {enableNetworkMenu && <NetworkMenu />}
          <TotalTokenBalance totalBalance={totalFiatAmount} loading={balancesLoading} />
          <Box
            sx={walletBalanceListContainerStyles(enableNetworkMenu, showAddCoins)}
          >
            {balancesLoading && (
              <Box sx={walletBalanceLoadingIconStyles}>
                <MenuItem shimmer emphasized testId="balance-item-shimmer--1" />
                <MenuItem shimmer emphasized testId="balance-item-shimmer--2" />
                <MenuItem shimmer emphasized testId="balance-item-shimmer--3" />
              </Box>
            )}
            {!balancesLoading && (
              <TokenBalanceList
                balanceInfoItems={balanceInfos}
                bridgeToL2OnClick={handleBridgeToL2OnClick}
                theme={theme}
              />
            )}
          </Box>
        </Box>
        {showAddCoins && (
          <MenuItem
            testId="add-coins"
            emphasized
            onClick={handleAddCoinsClick}
          >
            <MenuItem.FramedIcon icon="Add" />
            <MenuItem.Label>{t('views.WALLET_BALANCES.addCoins')}</MenuItem.Label>
          </MenuItem>
        )}
      </Box>
    </SimpleLayout>
  );
}

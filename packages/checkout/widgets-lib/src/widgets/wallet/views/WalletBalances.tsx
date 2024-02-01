import { Box, ButtCon, MenuItem } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { GasEstimateType, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import { utils } from 'ethers';
import { fetchTokenSymbols } from 'lib/fetchTokenSymbols';
import { CryptoFiatActions, CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { ButtonNavigationStyles } from 'components/Header/HeaderStyles';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
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
import { getL1ChainId, getL2ChainId } from '../../../lib/networkUtils';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { NotEnoughGas } from '../../../components/NotEnoughGas/NotEnoughGas';
import { isNativeToken } from '../../../lib/utils';
import {
  DEFAULT_TOKEN_DECIMALS,
  ETH_TOKEN_SYMBOL,
  ZERO_BALANCE_STRING,
} from '../../../lib';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../lib/providerUtils';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { BalanceInfo, mapTokenBalancesWithConversions } from '../functions/tokenBalances';

type WalletBalancesProps = {
  balancesLoading: boolean;
};
export function WalletBalances({
  balancesLoading,
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
  const [showNotEnoughGasDrawer, setShowNotEnoughGasDrawer] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [insufficientFundsForBridgeToL2Gas, setInsufficientFundsForBridgeToL2Gas] = useState(false);
  const isPassport = isPassportProvider(provider);
  const showNetworkMenu = !isPassport;

  const { track, page } = useAnalytics();

  const balanceInfos: BalanceInfo[] = useMemo(
    () => mapTokenBalancesWithConversions(network?.chainId!, tokenBalances, conversions),
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

      const tokenSymbols = await fetchTokenSymbols(checkout, network.chainId);

      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
          tokenSymbols,
        },
      });
    })();
  }, [checkout, cryptoFiatDispatch, network?.chainId]);

  useEffect(() => {
    const setWalletAddressFromProvider = async () => {
      if (!provider) return;
      setWalletAddress(await provider.getSigner().getAddress());
    };
    setWalletAddressFromProvider();
  }, [provider]);

  useEffect(() => {
    let totalAmount = 0.0;

    balanceInfos.forEach((balance) => {
      const fiatAmount = parseFloat(balance.fiatAmount);
      if (!Number.isNaN(fiatAmount)) totalAmount += fiatAmount;
    });

    setTotalFiatAmount(totalAmount);
  }, [balanceInfos]);

  // Silently runs a gas check for bridge to L2
  // This is to prevent the user having to wait for the gas estimate to complete to use the UI
  // As a trade-off there is a slight delay between when the gas estimate is fetched and checked
  // against the user balance, so 'move' can be selected before the gas estimate is completed
  useEffect(() => {
    const bridgeToL2GasCheck = async () => {
      if (!checkout) return;
      if (!network) return;
      if (network.chainId !== getL1ChainId(checkout.config)) return;

      const ethBalance = balanceInfos
        .find((balance) => isNativeToken(balance.address) && balance.symbol === ETH_TOKEN_SYMBOL);
      if (!ethBalance) return;

      if (ethBalance.balance === ZERO_BALANCE_STRING) {
        setInsufficientFundsForBridgeToL2Gas(true);
        return;
      }

      try {
        const { fees } = await checkout.gasEstimate({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        });

        if (!fees.totalFees) {
          setInsufficientFundsForBridgeToL2Gas(false);
          return;
        }

        setInsufficientFundsForBridgeToL2Gas(
          fees.totalFees.gt(utils.parseUnits(ethBalance.balance, DEFAULT_TOKEN_DECIMALS)),
        );
      } catch {
        setInsufficientFundsForBridgeToL2Gas(false);
      }
    };
    bridgeToL2GasCheck();
  }, [balanceInfos, checkout, network]);

  const showAddCoins = useMemo(() => {
    if (!checkout || !network) return false;
    return (
      network.chainId === getL2ChainId(checkout.config)
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
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SharedViews.TOP_UP_VIEW },
      },
    });
  };

  const handleBridgeToL2OnClick = (address?: string) => {
    if (insufficientFundsForBridgeToL2Gas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }
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
          {showNetworkMenu && <NetworkMenu />}
          <TotalTokenBalance totalBalance={totalFiatAmount} loading={balancesLoading} />
          <Box
            sx={walletBalanceListContainerStyles(showNetworkMenu, showAddCoins)}
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
        <NotEnoughGas
          environment={checkout?.config.environment ?? Environment.PRODUCTION}
          visible={showNotEnoughGasDrawer}
          showHeaderBar={false}
          onCloseDrawer={() => setShowNotEnoughGasDrawer(false)}
          walletAddress={walletAddress}
          showAdjustAmount={false}
          tokenSymbol={ETH_TOKEN_SYMBOL}
        />
      </Box>
    </SimpleLayout>
  );
}

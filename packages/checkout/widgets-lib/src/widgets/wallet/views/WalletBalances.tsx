import { Box, MenuItem } from '@biom3/react';
import {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import { GasEstimateType } from '@imtbl/checkout-sdk';
import { utils } from 'ethers';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { TotalTokenBalance } from '../components/TotalTokenBalance/TotalTokenBalance';
import { TokenBalanceList } from '../components/TokenBalanceList/TokenBalanceList';
import { NetworkMenu } from '../components/NetworkMenu/NetworkMenu';
import { WalletActions, WalletContext } from '../context/WalletContext';
import { sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import {
  walletBalanceOuterContainerStyles,
  walletBalanceContainerStyles,
  walletBalanceLoadingIconStyles,
  walletBalanceListContainerStyles,
} from './WalletBalancesStyles';
import { getL1ChainId, getL2ChainId } from '../../../lib/networkUtils';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { BalanceInfo, getTokenBalances } from '../functions/tokenBalances';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { fetchTokenSymbols } from '../../../lib/fetchTokenSymbols';
import { NotEnoughGas } from '../../../components/NotEnoughGas/NotEnoughGas';
import { isNativeToken, tokenValueFormat } from '../../../lib/utils';
import {
  DEFAULT_BALANCE_RETRY_POLICY,
  DEFAULT_TOKEN_DECIMALS,
  ETH_TOKEN_SYMBOL,
  ZERO_BALANCE_STRING,
} from '../../../lib';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../lib/providerUtils';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import MoreVertIcon from "@mui/icons-material/MoreVert";

export function WalletBalances() {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { viewDispatch } = useContext(ViewContext);
  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const { header } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const {
    network,
    supportedTopUps,
    tokenBalances,
  } = walletState;
  const { conversions } = cryptoFiatState;
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [showNotEnoughGasDrawer, setShowNotEnoughGasDrawer] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [insufficientFundsForBridgeToL2Gas, setInsufficientFundsForBridgeToL2Gas] = useState(false);
  const isPassport = isPassportProvider(provider);
  const showNetworkMenu = !isPassport;

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
  }, [checkout, cryptoFiatDispatch, network]);

  useEffect(() => {
    const setWalletAddressFromProvider = async () => {
      if (!provider) return;
      setWalletAddress(await provider.getSigner().getAddress());
    };
    setWalletAddressFromProvider();
  }, [provider]);

  useEffect(() => {
    let totalAmount = 0.0;

    tokenBalances.forEach((balance) => {
      const fiatAmount = parseFloat(balance.fiatAmount);
      if (!Number.isNaN(fiatAmount)) totalAmount += fiatAmount;
    });

    setTotalFiatAmount(totalAmount);
  }, [tokenBalances]);

  // Silently runs a gas check for bridge to L2
  // This is to prevent the user having to wait for the gas estimate to complete to use the UI
  // As a trade-off there is a slight delay between when the gas estimate is fetched and checked
  // against the user balance, so 'move' can be selected before the gas estimate is completed
  useEffect(() => {
    const bridgeToL2GasCheck = async () => {
      if (!checkout) return;
      if (!network) return;
      if (network.chainId !== getL1ChainId(checkout.config)) return;

      const ethBalance = tokenBalances
        .find((balance) => isNativeToken(balance.address) && balance.symbol === ETH_TOKEN_SYMBOL);
      if (!ethBalance) return;

      if (ethBalance.balance === ZERO_BALANCE_STRING) {
        setInsufficientFundsForBridgeToL2Gas(true);
        return;
      }

      try {
        const { gasFee } = await checkout.gasEstimate({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          isSpendingCapApprovalRequired: false,
        });

        if (!gasFee.estimatedAmount) {
          setInsufficientFundsForBridgeToL2Gas(false);
          return;
        }

        setInsufficientFundsForBridgeToL2Gas(
          gasFee.estimatedAmount.gt(utils.parseUnits(ethBalance.balance, DEFAULT_TOKEN_DECIMALS)),
        );
      } catch {
        setInsufficientFundsForBridgeToL2Gas(false);
      }
    };
    bridgeToL2GasCheck();
  }, [tokenBalances, checkout, network]);

  const showErrorView = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.ERROR_VIEW,
          error: new Error('Unable to fetch balances'),
        },
      },
    });
  }, [viewDispatch]);

  useEffect(() => {
    if (!checkout || !provider || !network || !conversions) return;
    if (conversions.size <= 0) return; // Prevent unnecessary re-rendering

    (async () => {
      let balances: BalanceInfo[] = [];
      try {
        balances = await getTokenBalances(checkout, provider, network.chainId, conversions);
      } catch (error: any) {
        if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(error)) {
          showErrorView();
          return;
        }
      }

      walletDispatch({
        payload: {
          type: WalletActions.SET_TOKEN_BALANCES,
          tokenBalances: balances,
        },
      });
      setBalancesLoading(false);
    })();
  }, [checkout, provider, network, conversions]);

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
          title={header.title}
          showSettings
          onSettingsClick={() => {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: { type: WalletWidgetViews.SETTINGS },
              },
            });
          }}
          onCloseButtonClick={() => sendWalletWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={walletBalanceOuterContainerStyles}
      >
        <Box sx={walletBalanceContainerStyles}>
          {showNetworkMenu && <NetworkMenu setBalancesLoading={setBalancesLoading} />}
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
                balanceInfoItems={tokenBalances}
                bridgeToL2OnClick={handleBridgeToL2OnClick}
              />
            )}
          </Box>
        </Box>
        {showAddCoins && (
          <ListItemButton onClick={handleAddCoinsClick}>
            <ListItemAvatar>
              <Avatar variant="square">
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText>Add Coins</ListItemText>
          </ListItemButton>)
        }
        <NotEnoughGas
          visible={showNotEnoughGasDrawer}
          showHeaderBar={false}
          onCloseBottomSheet={() => setShowNotEnoughGasDrawer(false)}
          walletAddress={walletAddress}
          showAdjustAmount={false}
        />
      </Box>
    </SimpleLayout>
  );
}

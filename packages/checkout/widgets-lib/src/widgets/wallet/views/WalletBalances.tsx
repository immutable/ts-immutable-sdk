import { Box, Icon, MenuItem } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
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
  WALLET_BALANCE_CONTAINER_STYLE,
  WalletBalanceItemStyle,
} from './WalletBalancesStyles';
import { getL2ChainId } from '../../../lib/networkUtils';
import {
  CryptoFiatContext,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { getTokenBalances } from '../functions/tokenBalances';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { useTokenSymbols } from '../../../lib/hooks/useTokenSymbols';

export function WalletBalances() {
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { viewDispatch } = useContext(ViewContext);
  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const { header } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const {
    provider,
    checkout,
    network,
    supportedTopUps,
    tokenBalances,
  } = walletState;
  const { conversions } = cryptoFiatState;
  const [balancesLoading, setBalancesLoading] = useState(true);
  useTokenSymbols(checkout, cryptoFiatDispatch);
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

  useEffect(() => {
    let totalAmount = 0.0;

    tokenBalances.forEach((balance) => {
      const fiatAmount = parseFloat(balance.fiatAmount);
      if (!Number.isNaN(fiatAmount)) totalAmount += fiatAmount;
    });
    setTotalFiatAmount(totalAmount);
  }, [tokenBalances]);

  const handleAddCoinsClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SharedViews.TOP_UP_VIEW },
      },
    });
  };

  useEffect(() => {
    if (!checkout || !provider || !network) return;
    (async () => {
      const balances = await getTokenBalances(
        checkout,
        provider,
        network.chainId,
        conversions,
      );

      walletDispatch({
        payload: {
          type: WalletActions.SET_TOKEN_BALANCES,
          tokenBalances: balances,
        },
      });
      setBalancesLoading(false);
    })();
  }, [
    checkout,
    network,
    provider,
    conversions,
    setBalancesLoading,
    walletDispatch]);

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
          onCloseButtonClick={sendWalletWidgetCloseEvent}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 'base.spacing.x2',
          paddingX: 'base.spacing.x2',
        }}
      >
        <Box sx={WALLET_BALANCE_CONTAINER_STYLE}>
          <NetworkMenu setBalancesLoading={setBalancesLoading} />
          <TotalTokenBalance totalBalance={totalFiatAmount} />
          <Box
            sx={WalletBalanceItemStyle(
              showAddCoins,
              tokenBalances.length > 2 || balancesLoading,
            )}
          >
            {balancesLoading && (
            <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            >
              <Icon
                testId="loading-icon"
                icon="Loading"
                sx={{ w: 'base.icon.size.500' }}
              />
            </Box>
            )}
            {!balancesLoading && (<TokenBalanceList balanceInfoItems={tokenBalances} />)}
          </Box>
        </Box>
        {showAddCoins && (
          <MenuItem
            testId="add-coins"
            emphasized
            onClick={handleAddCoinsClick}
          >
            <MenuItem.FramedIcon icon="Add" />
            <MenuItem.Label>Add coins</MenuItem.Label>
          </MenuItem>
        )}
      </Box>
    </SimpleLayout>
  );
}

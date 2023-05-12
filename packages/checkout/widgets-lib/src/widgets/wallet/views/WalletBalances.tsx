import { Box, MenuItem } from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WalletWidgetViews } from '../../../context/WalletViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { TotalTokenBalance } from '../components/TotalTokenBalance/TotalTokenBalance';
import { TokenBalanceList } from '../components/TokenBalanceList/TokenBalanceList';
import { NetworkMenu } from '../components/NetworkMenu/NetworkMenu';
import { useContext, useEffect, useMemo, useState } from 'react';
import { WalletActions, WalletContext } from '../context/WalletContext';
import { sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import {
  WalletBalanceContainerStyle,
  WalletBalanceItemStyle,
} from './WalletBalancesStyles';
import { sendAddCoinsEvent } from '../CoinTopUpEvents';
import { zkEVMNetwork } from '../../../lib/networkUtils';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { getTokenBalances } from '../functions/tokenBalances';

export const WalletBalances = () => {
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { header } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { provider, checkout, network, supportedTopUps } = walletState;
  const { conversions } = cryptoFiatState;
  const showAddCoins = useMemo(() => {
    if (!checkout || !network) return false;
    return (
      network?.chainId === zkEVMNetwork(checkout.config.environment) &&
      Boolean(
        supportedTopUps?.isBridgeEnabled ||
          supportedTopUps?.isSwapEnabled ||
          supportedTopUps?.isOnRampEnabled
      )
    );
  }, [checkout, network, supportedTopUps]);

  useEffect(() => {
    let totalAmount = 0.0;

    walletState.tokenBalances.forEach((balance) => {
      const fiatAmount = parseFloat(balance.fiatAmount);
      if (!isNaN(fiatAmount)) totalAmount += fiatAmount;
    });
    setTotalFiatAmount(totalAmount);
  }, [walletState.tokenBalances]);

  useEffect(() => {
    if (!checkout || !provider || !network) return;

    (async () => {
      const walletAddress = await provider.getSigner().getAddress();
      const getAllBalancesResult = await checkout.getAllBalances({
        provider,
        walletAddress,
        chainId: network.chainId,
      });

      const tokenSymbols: string[] = [];
      getAllBalancesResult.balances.forEach((balance) => {
        tokenSymbols.push(balance.token.symbol);
      });

      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
          tokenSymbols,
        },
      });
    })();
  }, [provider, checkout, network, cryptoFiatDispatch]);

  useEffect(() => {
    if (!checkout || !provider || !network) return;
    (async () => {
      const tokenBalances = await getTokenBalances(
        checkout,
        provider,
        network.name,
        network.chainId,
        conversions
      );

      walletDispatch({
        payload: {
          type: WalletActions.SET_TOKEN_BALANCES,
          tokenBalances,
        },
      });
    })();
  }, [checkout, network, provider, conversions, walletDispatch]);

  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);

  return (
    <SimpleLayout
      testId="wallet-balances"
      header={
        <HeaderNavigation
          title={header.title}
          showSettings
          onSettingsClick={() => console.log('settings click')}
          onCloseButtonClick={sendWalletWidgetCloseEvent}
        />
      }
      footer={<FooterLogo />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 'base.spacing.x2',
        }}
      >
        <Box sx={WalletBalanceContainerStyle}>
          <NetworkMenu />
          <TotalTokenBalance totalBalance={totalFiatAmount} />
          <Box
            sx={WalletBalanceItemStyle(
              showAddCoins,
              walletState.tokenBalances.length > 2
            )}
          >
            <TokenBalanceList balanceInfoItems={walletState.tokenBalances} />
          </Box>
        </Box>
        {showAddCoins && (
          <MenuItem
            testId="add-coins"
            emphasized
            onClick={() => {
              sendAddCoinsEvent({
                network: walletState.network ?? undefined,
              });
            }}
          >
            <MenuItem.FramedIcon icon="Add"></MenuItem.FramedIcon>
            <MenuItem.Label>Add coins</MenuItem.Label>
          </MenuItem>
        )}
      </Box>
    </SimpleLayout>
  );
};

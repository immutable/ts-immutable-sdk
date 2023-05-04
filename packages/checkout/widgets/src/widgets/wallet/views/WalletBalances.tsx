import { Box, MenuItem } from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WalletWidgetViews } from '../../../context/WalletViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { TotalTokenBalance } from '../components/TotalTokenBalance/TotalTokenBalance';
import { TokenBalanceList } from '../components/TokenBalanceList/TokenBalanceList';
import { NetworkMenu } from '../components/NetworkMenu/NetworkMenu';
import { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import { sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import {
  WalletBalanceContainerStyle,
  WalletBalanceItemStyle,
} from './WalletBalancesStyles';

export const WalletBalances = () => {
  const { walletState } = useContext(WalletContext);
  const { header } = text.views[WalletWidgetViews.WALLET_BALANCES];

  useEffect(() => {
    let totalAmount = 0.0;

    walletState.tokenBalances.forEach((balance) => {
      const fiatAmount = parseFloat(balance.fiatAmount);
      if (!isNaN(fiatAmount)) totalAmount += fiatAmount;
    });
    console.log(totalAmount);
    setTotalFiatAmount(totalAmount);
  }, [walletState.tokenBalances]);

  const [totalFiatAmount, setTotalFiatAmount] = useState(0.0);

  return (
    <SimpleLayout
      testId="wallet-balances"
      header={
        <HeaderNavigation
          title={header.title}
          showSettings
          showClose
          onSettingsClick={() => console.log('settings click')}
          onCloseButtonClick={sendWalletWidgetCloseEvent}
        />
      }
      footer={<FooterLogo />}
    >
      <Box sx={WalletBalanceContainerStyle}>
        <NetworkMenu />
        <TotalTokenBalance totalBalance={totalFiatAmount} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={WalletBalanceItemStyle}>
            <TokenBalanceList balanceInfoItems={walletState.tokenBalances} />
          </Box>
          <MenuItem
            testId="add-coins"
            emphasized
            onClick={() => console.log('add coins')}
          >
            <MenuItem.FramedIcon icon="Add"></MenuItem.FramedIcon>
            <MenuItem.Label>Add coins</MenuItem.Label>
          </MenuItem>
        </Box>
      </Box>
    </SimpleLayout>
  );
};

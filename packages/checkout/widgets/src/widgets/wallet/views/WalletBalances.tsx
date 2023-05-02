import { Box } from "@biom3/react";
import { FooterLogo } from "../../../components/Footer/FooterLogo";
import { HeaderNavigation } from "../../../components/Header/HeaderNavigation"
import { SimpleLayout } from "../../../components/SimpleLayout/SimpleLayout"
import { WalletWidgetViews } from "../../../context/WalletViewContextTypes"
import { text } from '../../../resources/text/textConfig';
import { TotalTokenBalance } from "../components/TotalTokenBalance";
import { TokenBalanceList } from "../components/TokenBalanceList";
import { BalanceInfo } from "../components/BalanceItem";
import { WidgetBodyStyle } from "../WalletStyles";
import { NetworkMenu } from "../components/NetworkStatus/NetworkMenu";
import { ChainId, Checkout } from "@imtbl/checkout-sdk-web";
import { Web3Provider } from "@ethersproject/providers";

export interface WalletBalancesProps {
  tokenBalances: BalanceInfo[];
  totalFiatAmount: number;
  networkName: string;
  getTokenBalances: (checkout: Checkout, provider: Web3Provider, networkName: string, chainId: ChainId) => void;
}

export const WalletBalances = ({ tokenBalances, totalFiatAmount, getTokenBalances}: WalletBalancesProps) => {
  const {header} = text.views[WalletWidgetViews.WALLET_BALANCES];
  return(
    <SimpleLayout
      testId="wallet-balances"
      header={<HeaderNavigation title={header.title} showSettings showClose onSettingsClick={() => console.log('settings click')} />}
      footer={<FooterLogo />}
    >
      <Box sx={{
        backgroundColor: 'base.color.neutral.800',
        paddingY: 'base.spacing.x4',
        paddingX: 'base.spacing.x1',
        borderRadius: 'base.borderRadius.x6'
        }}>
        <NetworkMenu getTokenBalances={getTokenBalances} />
        <TotalTokenBalance totalBalance={totalFiatAmount} />
        <Box sx={WidgetBodyStyle}>
          <TokenBalanceList balanceInfoItems={tokenBalances} />
        </Box>
      </Box>
    </SimpleLayout>
  )
}
import { Body, Box } from '@biom3/react';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { TokenBalanceListStyle } from './TokenBalanceListStyles';
import { text } from '../../../../resources/text/textConfig';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[];
}
export const TokenBalanceList = (props: TokenBalanceListProps) => {
  const { balanceInfoItems } = props;
  const { noTokensFound } =
    text.views[WalletWidgetViews.WALLET_BALANCES].tokenBalancesList;

  return (
    <Box sx={TokenBalanceListStyle}>
      {balanceInfoItems.length === 0 && <Body>{noTokensFound}</Body>}
      {balanceInfoItems.map((balance) => (
        <BalanceItem key={balance.id} balanceInfo={balance}></BalanceItem>
      ))}
    </Box>
  );
};

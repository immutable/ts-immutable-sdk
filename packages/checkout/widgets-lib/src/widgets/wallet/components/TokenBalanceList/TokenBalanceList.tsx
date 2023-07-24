import { Body, Box } from '@biom3/react';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { tokenBalanceListStyle } from './TokenBalanceListStyles';
import { text } from '../../../../resources/text/textConfig';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[];
  bridgeToL2OnClick: (address?: string) => void;
}
export function TokenBalanceList({
  balanceInfoItems,
  bridgeToL2OnClick,
}: TokenBalanceListProps) {
  const { noTokensFound } = text.views[WalletWidgetViews.WALLET_BALANCES].tokenBalancesList;

  return (
    <Box sx={tokenBalanceListStyle}>
      {balanceInfoItems.length === 0 && <Body testId="no-tokens-found">{noTokensFound}</Body>}
      {balanceInfoItems.map((balance) => (
        <BalanceItem
          key={balance.id}
          balanceInfo={balance}
          bridgeToL2OnClick={bridgeToL2OnClick}
        />
      ))}
    </Box>
  );
}

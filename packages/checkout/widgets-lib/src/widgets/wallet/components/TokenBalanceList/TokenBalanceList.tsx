import { Body, Box } from '@biom3/react';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { tokenBalanceListStyle, noTokensStyle } from './TokenBalanceListStyles';
import { text } from '../../../../resources/text/textConfig';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';
import { isNativeToken } from '../../../../lib/utils';
import { ZERO_BALANCE_STRING } from '../../../../lib';

const filterZeroBalances = (balanceInfoItems: BalanceInfo[]) => balanceInfoItems.filter(
  (balance) => balance.balance !== ZERO_BALANCE_STRING || isNativeToken(balance.address),
);

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[];
  bridgeToL2OnClick: (address?: string) => void;
}
export function TokenBalanceList({
  balanceInfoItems,
  bridgeToL2OnClick,
}: TokenBalanceListProps) {
  const { noTokensFound } = text.views[WalletWidgetViews.WALLET_BALANCES].tokenBalancesList;
  const filteredBalances = filterZeroBalances(balanceInfoItems);

  return (
    <Box sx={tokenBalanceListStyle}>
      {filteredBalances.length === 0
      && (
      <Box sx={noTokensStyle}>
        <Body testId="no-tokens-found">{noTokensFound}</Body>
      </Box>
      )}
      {filteredBalances.map((balance) => (
        <BalanceItem
          key={balance.id}
          balanceInfo={balance}
          bridgeToL2OnClick={bridgeToL2OnClick}
        />
      ))}
    </Box>
  );
}

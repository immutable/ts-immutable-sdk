import { Body, Box } from '@biom3/react';
import React from 'react';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { BalanceInfo } from '../../types/BalanceInfo';
import { TokenBalanceListStyles } from './TokenBalanceListStyles';
import { text } from '../../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../../context/WalletViewContextTypes';

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[];
}
export const TokenBalanceList = (props: TokenBalanceListProps) => {
  const { balanceInfoItems } = props;
  const { noTokensFound } =
    text.views[WalletWidgetViews.WALLET_BALANCES].tokenBalancesList;

  return (
    <Box sx={TokenBalanceListStyles}>
      {balanceInfoItems.length === 0 && <Body>{noTokensFound}</Body>}
      {balanceInfoItems.map((balance) => (
        <BalanceItem key={balance.id} balanceInfo={balance}></BalanceItem>
      ))}
    </Box>
  );
};

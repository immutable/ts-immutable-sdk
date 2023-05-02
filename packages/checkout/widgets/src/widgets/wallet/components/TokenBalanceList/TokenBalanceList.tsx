import { Body, Box } from '@biom3/react';
import React from 'react';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { BalanceInfo } from '../../types/BalanceInfo';
import { TokenBalanceListStyles } from './TokenBalanceListStyles';

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[];
}
export const TokenBalanceList = (props: TokenBalanceListProps) => {
  const { balanceInfoItems } = props;

  return (
    <Box sx={TokenBalanceListStyles}>
      {balanceInfoItems.length === 0 && <Body>No tokens found</Body>}
      {balanceInfoItems.map((balance) => (
        <BalanceItem key={balance.id} balanceInfo={balance}></BalanceItem>
      ))}
    </Box>
  );
};

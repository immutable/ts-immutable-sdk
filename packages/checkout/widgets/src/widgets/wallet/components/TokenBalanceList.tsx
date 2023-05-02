import { Body } from '@biom3/react';
import React from 'react';
import { BalanceItem } from './BalanceItem';
import { BalanceInfo } from '../types/BalanceInfo';

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[] | undefined;
}
export const TokenBalanceList = (props: TokenBalanceListProps) => {
  const { balanceInfoItems } = props;

  return (
    <>
      {balanceInfoItems?.length === 0 && <Body>No tokens found</Body>}
      {balanceInfoItems?.map((balance) => (
        <BalanceItem key={balance.id} balanceInfo={balance}></BalanceItem>
      ))}
    </>
  );
};

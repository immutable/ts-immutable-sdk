import { Body, Box } from '@biom3/react';
import React from 'react';
import { BalanceInfo } from '../types/BalanceInfo';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: BalanceItemProps) => {
  const { balanceInfo } = props;
  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}`}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Body>{balanceInfo.symbol}</Body>
        <Body size="small">{balanceInfo.description}</Body>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <Body testId={`balance-item-${balanceInfo.symbol}-balance`}>
          {balanceInfo.balance}
        </Body>
        <Body testId={`balance-item-${balanceInfo.symbol}-fiat`} size="xSmall">
          &asymp; USD ${balanceInfo.fiatAmount}
        </Body>
      </Box>
    </Box>
  );
};

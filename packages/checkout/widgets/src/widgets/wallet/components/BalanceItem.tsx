import { Body, Box } from '@biom3/react';
import React from 'react'
export interface BalanceInfo {
  id: string;
  symbol: string;
  description?: string;
  balance: string;
  fiatAmount: string;
  iconLogo?: string;
}
export interface TokenBalanceInfo{
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: TokenBalanceInfo) => {
  const {balanceInfo} =props;
  return (
    <Box testId={`balance-item-${balanceInfo.symbol}`} sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
      <Box sx={{display: 'flex', flexDirection: "column"}}>
        <Body>{balanceInfo.symbol}</Body>
        <Body size="small">{balanceInfo.description}</Body>
      </Box>
      <Box sx={{display: 'flex', flexDirection: "column", alignItems: "flex-end"}}>
        <Body testId={`balance-item-${balanceInfo.symbol}-balance`}>{balanceInfo.balance}</Body>
        <Body testId={`balance-item-${balanceInfo.symbol}-fiat`} size="xSmall">AUD ${balanceInfo.fiatAmount}</Body>
      </Box>
    </Box>
  )
}

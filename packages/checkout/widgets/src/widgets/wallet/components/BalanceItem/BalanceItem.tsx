import { Body, Box, Heading, Icon, PriceDisplay } from '@biom3/react';
import React from 'react';
import { BalanceInfo } from '../../types/BalanceInfo';
import { BalanceItemContainerStyles } from './BalanceItemStyles';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: BalanceItemProps) => {
  const { balanceInfo } = props;
  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}`}
      sx={BalanceItemContainerStyles}
    >
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 'base.spacing.x5'}}>
        <Icon icon='EthToken' sx={{width: 'base.icon.size.300'}}/>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Body>{balanceInfo.symbol}</Body>
          <Body size="small">{balanceInfo.description}</Body>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <PriceDisplay
          testId={`balance-item-${balanceInfo.symbol}`}
          use={Heading}
          size="xSmall"
          price={balanceInfo.balance}
          fiatAmount={`USD ${balanceInfo.fiatAmount}`}
          // currencyImageUrl="https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg"
        />
      </Box>
    </Box>
  );
};

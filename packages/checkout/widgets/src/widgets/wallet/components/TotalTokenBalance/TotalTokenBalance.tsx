import { Body, Box } from '@biom3/react';
import {
  TotalTokenBalanceStyle,
  TotalTokenBalanceValueStyle,
} from './TotalTokenBalanceStyles';

interface TotalTokenBalanceProps {
  totalBalance: number;
}

export const TotalTokenBalance = (props: TotalTokenBalanceProps) => {
  const { totalBalance } = props;
  return (
    <Box sx={TotalTokenBalanceStyle}>
      <Body testId="heading" size={'medium'}>
        Coins
      </Body>
      <Box sx={TotalTokenBalanceValueStyle}>
        <Body size={'medium'} weight="bold">
          Value
        </Body>
        <Body testId="total-token-balance" size={'medium'} weight="bold">
          &asymp; USD ${totalBalance.toFixed(2)}
        </Body>
      </Box>
    </Box>
  );
};

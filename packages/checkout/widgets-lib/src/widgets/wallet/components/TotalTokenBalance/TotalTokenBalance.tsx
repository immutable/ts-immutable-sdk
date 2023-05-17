import { Body, Box } from '@biom3/react';
import {
  totalTokenBalanceStyle,
  totalTokenBalanceValueStyle,
} from './TotalTokenBalanceStyles';

interface TotalTokenBalanceProps {
  totalBalance: number;
}

export function TotalTokenBalance(props: TotalTokenBalanceProps) {
  const { totalBalance } = props;
  return (
    <Box sx={totalTokenBalanceStyle}>
      <Body testId="heading" size="medium">
        Coins
      </Body>
      <Box sx={totalTokenBalanceValueStyle}>
        <Body size="medium" weight="bold">
          Value
        </Body>
        <Body testId="total-token-balance" size="medium" weight="bold">
          &asymp; USD $
          {totalBalance.toFixed(2)}
        </Body>
      </Box>
    </Box>
  );
}

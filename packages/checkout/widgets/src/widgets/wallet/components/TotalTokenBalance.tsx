import { Body, Box } from '@biom3/react';

interface TotalTokenBalanceProps {
  totalBalance: number;
}

export const TotalTokenBalance = (props: TotalTokenBalanceProps) => {
  const { totalBalance } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingX: 'base.spacing.x3',
        paddingY: 'base.spacing.x2',
      }}
    >
      <Body testId="heading" size={'medium'}>
        Coins
      </Body>
      <Box
        sx={{ display: 'flex', direction: 'row', columnGap: 'base.spacing.x1' }}
      >
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

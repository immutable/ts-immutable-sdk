import { Body, Box, Heading } from '@biom3/react';
import { WidgetSubHeadingStyle } from '../WalletStyles';

interface TotalTokenBalanceProps {
  totalBalance: number;
}

export const TotalTokenBalance = (props: TotalTokenBalanceProps) => {
  const { totalBalance } = props;
  return (
    <Box sx={WidgetSubHeadingStyle}>
      <Heading testId="heading" size={'medium'}>
        {' '}
        Tokens
      </Heading>
      <Box
        sx={{ display: 'flex', direction: 'row', columnGap: 'base.spacing.x1' }}
      >
        <Body size={'medium'}>Value:</Body>
        <Body testId="total-token-balance" size={'medium'}>
          ${totalBalance.toFixed(2)}
        </Body>
      </Box>
    </Box>
  );
};

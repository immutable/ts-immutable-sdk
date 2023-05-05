import { Body, Box, Heading } from '@biom3/react';

export interface FeeProps {
  fees: string;
  slippage: string;
  tokenSymbol: string;
}

export const Fees = (feeProps: FeeProps) => {
  const { fees, slippage, tokenSymbol } = feeProps;

  return (
    <Box>
      <Heading size="xSmall">Fees:</Heading>
      <Body>
        {fees} {tokenSymbol}
      </Body>
      <Heading size="xSmall">Slippage:</Heading>
      <Body>{slippage}</Body>
    </Box>
  );
};

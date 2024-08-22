/* eslint-disable react/no-array-index-key */
/* eslint-disable no-console */
import { Body, Box, Heading } from '@biom3/react';
import { TokenAmount } from '@lifi/sdk';

export function Balances({
  balances,
}: {
  balances: { [chainId: number]: TokenAmount[] } | undefined;
}) {
  return (
    <Box
      sx={{
        borderRadius: '35px',
        padding: '20px',
        backgroundColor: 'base.color.neutral.1000',
        marginBottom: '20px',
      }}
    >
      {balances
        && Object.keys(balances).map((chainId) => (
          <Box key={chainId}>
            <Heading size="small">
              Balances for chainId
              {chainId}
              :
            </Heading>
            {balances[chainId].map((balance: TokenAmount, index: number) => (
              <Box
                key={index}
                sx={{ display: 'flex', flexDirection: 'column' }}
              >
                <Body weight="bold">
                  Token:
                  {balance.symbol}
                </Body>
                <Body>
                  Address:
                  {balance.address}
                </Body>
                <Body>
                  Balance:
                  {balance.amount?.toString()}
                </Body>
                <Body>
                  Decimals:
                  {balance.decimals}
                </Body>
                <Body>
                  Price USD:
                  {balance.priceUSD}
                </Body>
                <hr />
              </Box>
            ))}
          </Box>
        ))}
    </Box>
  );
}

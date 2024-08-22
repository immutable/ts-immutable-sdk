/* eslint-disable react/no-array-index-key */
/* eslint-disable no-console */
import { Box } from '@biom3/react';
import { LiFiStep, TokenAmount } from '@lifi/sdk';

export interface PocProps {
  balances: { [chainId: number]: TokenAmount[] } | undefined;
  quotes: LiFiStep[] | undefined;
}

export function Poc({ balances, quotes }: PocProps) {
  console.log('balances', balances);
  console.log('quotes', quotes);
  return (
    <Box sx={{ border: '3px solid black', padding: '20px' }}>
      BALANCES
      {balances ? (
        Object.keys(balances).map((chainId) => (
          <div key={chainId}>
            <h3>
              Balances for chainId
              {chainId}
              :
            </h3>
            {balances[chainId].map((balance: TokenAmount, index: number) => (
              <div key={index}>
                <p>
                  Token:
                  {balance.symbol}
                </p>
                <p>
                  Address:
                  {balance.address}
                </p>
                <p>
                  Balance:
                  {balance.amount?.toString()}
                </p>
                <p>
                  Decimals:
                  {balance.decimals}
                </p>
                <p>
                  Price USD:
                  {balance.priceUSD}
                </p>
                <hr />
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>Loading balances...</p>
      )}
    </Box>
  );
}

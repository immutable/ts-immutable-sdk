/* eslint-disable react/no-array-index-key */
/* eslint-disable no-console */
import {
  Body, Box, Heading, CloudImage,
} from '@biom3/react';
import { LiFiStep } from '@lifi/sdk';

export function Quotes({ quotes }: { quotes: LiFiStep[] | undefined }) {
  return (
    <Box
      sx={{
        borderRadius: '35px',
        padding: '20px',
        backgroundColor: 'base.color.neutral.1000',
        marginBottom: '20px',
      }}
    >
      {quotes
        && quotes.map((quote, index) => (
          <Box key={index} sx={{ marginBottom: '20px' }}>
            <Heading size="small">
              Quote ID:
              {quote.id}
            </Heading>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudImage
                use={(
                  <img
                    src={quote.toolDetails.logoURI}
                    alt={quote.toolDetails.name}
                  />
                )}
                sx={{ width: '32px', height: '32px', marginRight: '10px' }}
              />
              <Body>
                Tool:
                {quote.toolDetails.name}
              </Body>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '10px',
              }}
            >
              <Heading size="xSmall">From</Heading>
              <Body>
                Chain ID:
                {quote.action.fromChainId}
              </Body>
              <Body>
                Token:
                {quote.action.fromToken.symbol}
              </Body>
              <Body>
                Amount:
                {quote.action.fromAmount}
              </Body>
              <Body>
                To Address:
                {quote.action.toAddress}
              </Body>
              <Heading size="xSmall" sx={{ marginTop: '10px' }}>
                To
              </Heading>
              <Body>
                Chain ID:
                {quote.action.toChainId}
              </Body>
              <Body>
                Token:
                {quote.action.toToken.symbol}
              </Body>
              <Body>
                Amount:
                {quote.estimate.toAmount}
              </Body>
              <Body>
                Min Amount:
                {quote.estimate.toAmountMin}
              </Body>
              <Heading size="xSmall" sx={{ marginTop: '10px' }}>
                Fees
              </Heading>
              {quote.estimate.feeCosts
                && quote.estimate.feeCosts.map((fee, feeIndex) => (
                  <Box
                    key={feeIndex}
                    sx={{
                      marginBottom: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Body weight="bold">{fee.name}</Body>
                    <Body>
                      Amount:
                      {fee.amount}
                    </Body>
                    <Body>
                      Amount USD: $
                      {fee.amountUSD}
                    </Body>
                    <Body>
                      Included:
                      {fee.included ? 'Yes' : 'No'}
                    </Body>
                  </Box>
                ))}
              <Heading size="xSmall" sx={{ marginTop: '10px' }}>
                Gas Costs
              </Heading>
              {quote.estimate.gasCosts
                && quote.estimate.gasCosts.map((gas, gasIndex) => (
                  <Box
                    key={gasIndex}
                    sx={{
                      marginBottom: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Body>
                      Type:
                      {gas.type}
                    </Body>
                    <Body>
                      Estimate:
                      {gas.estimate}
                    </Body>
                    <Body>
                      Amount:
                      {gas.amount}
                    </Body>
                    <Body>
                      Amount USD: $
                      {gas.amountUSD}
                    </Body>
                  </Box>
                ))}
            </Box>
          </Box>
        ))}
    </Box>
  );
}

import { TextInput, Box, Body } from '@biom3/react';
import { BigNumber, utils, BigNumberish } from 'ethers';
import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { TokenInfo, GetBalanceResult } from '@imtbl/checkout-sdk';
import TokenSelect from './TokenSelect';
// TODO: fix circular dependency
// eslint-disable-next-line import/no-cycle
import { QuoteResponse } from '../views/SwapCoins';
import { findTokenByAddress } from '../helpers';
import { SwapContext } from '../context/SwapContext';

type WithProps = {
  onTokenChange: (token: TokenInfo) => void;
  onQuoteChange: (token: QuoteResponse) => void;
  token?: TokenInfo;
  quote?: QuoteResponse;
  buyToken: TokenInfo;
  buyAmount: BigNumber;
};

async function getQuoteFromAmountOut(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountOut: BigNumberish,
): Promise<QuoteResponse> {
  return {
    status: 'ok',
    trade: {
      amountIn: BigNumber.from(amountOut).mul(10),
      amountOut: BigNumber.from(amountOut),
      tokenIn: {} as TokenInfo,
      tokenOut: {} as TokenInfo,
      fees: {
        amount: {
          bn: BigNumber.from('1000000000000'),
          formatted: '0.123',
        },
        percent: 0.1,
        token: {} as TokenInfo,
      },
      slippage: {
        amount: {
          bn: BigNumber.from('1000000000000'),
          formatted: '0.123',
        },
        percent: 0.1,
      },
    },
  };
}

export default function With(props: WithProps) {
  const {
    onTokenChange, onQuoteChange, token, quote, buyToken, buyAmount,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [debounceId, setDebounceId] = useState<string | null>();

  const { swapState } = useContext(SwapContext);
  const { tokenBalances, allowedTokens } = swapState;

  const quoteAmount = (
    (quote
      && utils.formatUnits(quote.trade.amountIn.toString(), token?.decimals))
    || 0
  )?.toString();

  const nonZeroBalances = useMemo(() => tokenBalances
    .filter((balance: GetBalanceResult) => balance.balance.gt(0))
    .map((balance: GetBalanceResult) => ({
      ...balance,
      token: findTokenByAddress(allowedTokens, balance.token.address || '')!,
    })), [tokenBalances, allowedTokens]);

  const generateQuote = async () => {
    const newQuote = await getQuoteFromAmountOut(
      token?.address || '',
      buyToken?.address || '',
      buyAmount!,
    );

    onQuoteChange(newQuote);
    setLoading(false);
  };

  const debounce = (func: () => {}, threshold: number) => {
    if (debounceId) {
      clearTimeout(debounceId);
    }

    setDebounceId(
      setTimeout(() => {
        setDebounceId(null);
        func();
      }, threshold).toString(),
    );
  };

  useEffect(() => {
    if (buyToken && buyAmount && token) {
      debounce(generateQuote, 1000);
      setLoading(true);
    }
  }, [buyAmount, buyToken, token]);

  useEffect(() => {
    if (nonZeroBalances.length > 0) {
      onTokenChange(nonZeroBalances[0].token);
    }
  }, [nonZeroBalances, onTokenChange]);

  return (
    <Box sx={{ mt: '20px' }}>
      <Body as="h4">With</Body>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextInput
          testId="withField__amount"
          disabled
          hideClearValueButton
          value={quoteAmount}
        />
        <TokenSelect
          testId="withField"
          allowedTokens={allowedTokens}
          token={token}
          onChange={onTokenChange}
          // TODO: token is declared in the upper scope
          // eslint-disable-next-line @typescript-eslint/no-shadow
          filter={allowedTokens.map((token) => token?.address ?? '')}
        />
      </Box>
      {loading && <Body>Loading</Body>}
    </Box>
  );
}

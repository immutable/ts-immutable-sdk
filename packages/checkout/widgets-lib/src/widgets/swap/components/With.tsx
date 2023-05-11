import { TextInput, Box, Body } from '@biom3/react';
import { BigNumber, utils, BigNumberish } from 'ethers';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { TokenInfo, GetBalanceResult } from '@imtbl/checkout-sdk';
import TokenSelect from './TokenSelect';
import { QuoteResponse } from '../views/SwapCoins';
import { findTokenByAddress } from '../helpers';
import { SwapActions, SwapContext } from '../context/SwapContext';

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
  amountOut: BigNumberish
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
  const { onTokenChange, onQuoteChange, token, quote, buyToken, buyAmount } =
    props;
  const [loading, setLoading] = useState<boolean>(false);
  const [debounceId, setDebounceId] = useState<string | null>();

  const { swapState, swapDispatch } = useContext(SwapContext);
  const { checkout, provider, network, tokenBalances, allowedTokens } =
    swapState;

  const quoteAmount = (
    (quote &&
      utils.formatUnits(quote.trade.amountIn.toString(), token?.decimals)) ||
    0
  )?.toString();

  const fetchBalances = useCallback(async () => {
    if (!checkout || !provider || !network) return;

    const walletAddress = await provider.getSigner().getAddress();
    const result = await checkout.getAllBalances({
      provider: provider,
      chainId: network.chainId,
      walletAddress,
    });

    const resolvedBalances = result.balances
      .filter((balance: GetBalanceResult) => balance.balance.gt(0))
      .map((balance: GetBalanceResult) => ({
        ...balance,
        token: findTokenByAddress(allowedTokens, balance.token.address || '')!,
      }));

    swapDispatch({
      payload: {
        type: SwapActions.SET_TOKEN_BALANCES,
        tokenBalances: resolvedBalances,
      },
    });

    if (resolvedBalances.length > 0) {
      onTokenChange(resolvedBalances[0].token);
    }
  }, [checkout, provider, network, allowedTokens, swapDispatch, onTokenChange]);

  const generateQuote = async () => {
    const newQuote = await getQuoteFromAmountOut(
      token?.address || '',
      buyToken?.address || '',
      buyAmount!
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
      }, threshold).toString()
    );
  };

  useEffect(() => {
    if (buyToken && buyAmount && token) {
      debounce(generateQuote, 1000);
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyAmount, buyToken, token]);

  useEffect(() => {
    if (!tokenBalances) {
      fetchBalances();
    }
  }, [tokenBalances, fetchBalances]);

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
          filter={allowedTokens.map((token) => token?.address ?? '')}
        />
      </Box>
      {loading && <Body>Loading</Body>}
    </Box>
  );
}

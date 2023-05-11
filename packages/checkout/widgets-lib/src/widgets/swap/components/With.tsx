import { TextInput, Box, Body } from '@biom3/react';
import { BigNumber, utils, BigNumberish } from 'ethers';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ConnectResult,
  TokenInfo,
  Checkout,
  GetBalanceResult,
} from '@imtbl/checkout-sdk';
import TokenSelect from './TokenSelect';
import { QuoteResponse } from './SwapForm';
import { findTokenByAddress } from '../helpers';
import { Environment } from '@imtbl/config';

type WithProps = {
  onTokenChange: (token: TokenInfo) => void;
  onQuoteChange: (token: QuoteResponse) => void;
  tokenAllowList: TokenInfo[];
  token?: TokenInfo;
  quote?: QuoteResponse;
  buyToken: TokenInfo;
  buyAmount: BigNumber;
  connection: ConnectResult;
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
  const {
    onTokenChange,
    onQuoteChange,
    token,
    quote,
    buyToken,
    buyAmount,
    connection,
    tokenAllowList,
  } = props;
  const [balances, setBalances] = useState<GetBalanceResult[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [debounceId, setDebounceId] = useState<string | null>();
  // TODO: update here to go to context and stop hardcoing
  const checkout = useMemo(
    () =>
      new Checkout({
        baseConfig: { environment: Environment.SANDBOX },
      }),
    []
  );
  const quoteAmount = (
    (quote &&
      utils.formatUnits(quote.trade.amountIn.toString(), token?.decimals)) ||
    0
  )?.toString();

  const allowedTokens = (): string[] => {
    return (balances || []).map(
      (balance: GetBalanceResult) => balance.token.address || ''
    );
  };

  const fetchBalances = useCallback(async () => {
    const walletAddress = await connection.provider.getSigner().getAddress();
    const result = await checkout.getAllBalances({
      provider: connection.provider,
      chainId: 1, //TODO: THIS NEEDS TO BE CHANGED BACK TO THE CURRENT NETWORK CHAIN ID
      walletAddress,
    });

    const resolvedBalances = result.balances
      .filter((balance: GetBalanceResult) => balance.balance.gt(0))
      .map((balance: GetBalanceResult) => ({
        ...balance,
        token: findTokenByAddress(tokenAllowList, balance.token.address || '')!,
      }));

    setBalances(resolvedBalances);

    if (resolvedBalances.length > 0) {
      onTokenChange(resolvedBalances[0].token);
    }
  }, [connection, checkout, tokenAllowList, onTokenChange]);

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
    if (!balances) {
      fetchBalances();
    }
  }, [balances, fetchBalances]);

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
          token={token}
          onChange={onTokenChange}
          connection={connection}
          filter={allowedTokens()}
        />
      </Box>
      {loading && <Body>Loading</Body>}
    </Box>
  );
}

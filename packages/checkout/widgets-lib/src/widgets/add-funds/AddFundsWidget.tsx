/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import { AddFundsWidgetParams } from '@imtbl/checkout-sdk/dist/widgets/definitions/parameters/addFunds';
import { Web3Provider } from '@ethersproject/providers';
import {
  useEffect, useMemo, useReducer, useState,
} from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import {
  ChainId,
  CoinKey,
  ContractCallsQuoteRequest,
  createConfig,
  EVM,
  getContractCallsQuote,
  getTokenBalancesByChain,
  LiFiStep,
  TokenAmount,
} from '@lifi/sdk';
import { findDefaultToken } from '@lifi/data-types';
import {
  Body, Box, Button, Heading,
} from '@biom3/react';
import {
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { Balances } from './components/Balances';
import { Quotes } from './components/Quotes';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  web3Provider?: Web3Provider;
};

export default function AddFundsWidget({ web3Provider }: AddFundsWidgetInputs) {
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const [balances, setBalances] = useState<
  { [chainId: number]: TokenAmount[] } | undefined
  >();
  const [quotes, setQuotes] = useState<LiFiStep[] | undefined>();
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [balanceFetchTime, setBalanceFetchTime] = useState<number | null>(null);
  const [quoteFetchTime, setQuoteFetchTime] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<{
    code: string;
    message: string;
  } | null>(null);

  const viewReducerValues = useMemo(
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );

  const richWallet = '0x61Ed281e487502458f84752eB367697d6BB5778a';

  useEffect(() => {
    const initializeLifiConfig = async () => {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom({
          async request({ method, params }) {
            const response = await web3Provider?.jsonRpcFetchFunc(
              method,
              params,
            );
            return response;
          },
        }),
      });

      const evmProvider = EVM({
        getWalletClient: async () => client,
      });

      createConfig({
        integrator: 'immutable',
        routeOptions: {
          bridges: {
            allow: ['squid'],
          },
        },
        apiKey:
          '0809bf15-d159-42dd-b079-756d1c3b0458.d17e73a9-93fa-4d60-ac1e-a1a027425c3b',
        providers: [evmProvider],
      });
    };

    initializeLifiConfig();
  }, [web3Provider]);

  const fetchBalances = async () => {
    setBalances(undefined);
    setIsLoadingBalances(true);
    const start = Date.now();

    const tokensByChain = {
      1: [
        {
          chainId: 1,
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          name: 'ETH',
          decimals: 18,
          priceUSD: '2617.08',
          CoinKey: 'ETH',
        },
      ],
      10: [
        {
          chainId: 10,
          address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
          symbol: 'USDT',
          name: 'USDT',
          decimals: 6,
          priceUSD: '1.00015',
          ConinKey: 'USDT',
        },
        {
          chainId: 10,
          address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          priceUSD: '0.9998000399920016',
          ConinKey: 'USDC',
        },
      ],
    };

    try {
      const balancesResponse = await getTokenBalancesByChain(
        richWallet,
        tokensByChain,
      );
      setBalances(balancesResponse);
      console.log('===== balanceResponse', balancesResponse);
    } catch (error: any) {
      console.error('===== balanceResponse ERROR', error);
      setBalanceError({
        code: error.code || 'UNKNOWN_ERROR',
        message:
          error.message || 'An unknown error occurred while fetching balances.',
      });
    } finally {
      const end = Date.now();
      setBalanceFetchTime((end - start) / 1000);
      setIsLoadingBalances(false);
    }
  };

  const fetchQuotes = async () => {
    setQuotes(undefined);
    setIsLoadingQuotes(true);
    const start = Date.now();

    const configs = [
      {
        fromChain: ChainId.OPT,
        fromToken: findDefaultToken(CoinKey.USDT, ChainId.OPT).address,
        toChain: ChainId.MNT,
        toToken: findDefaultToken(CoinKey.USDC, ChainId.MNT).address,
        toAmount: '1000000',
      },
      {
        fromChain: ChainId.OPT,
        fromToken: findDefaultToken(CoinKey.USDC, ChainId.OPT).address,
        toChain: ChainId.MNT,
        toToken: findDefaultToken(CoinKey.USDC, ChainId.MNT).address,
        toAmount: '1000000',
      },
      {
        fromChain: ChainId.ETH,
        fromToken: findDefaultToken(CoinKey.ETH, ChainId.ETH).address,
        toChain: ChainId.OPT,
        toToken: findDefaultToken(CoinKey.ETH, ChainId.OPT).address,
        toAmount: '1000000000000000',
      },
    ];

    const quoteRequests = configs.map((config) => {
      const quoteRequest: ContractCallsQuoteRequest = {
        fromChain: config.fromChain,
        fromToken: config.fromToken,
        fromAddress: richWallet!,
        toChain: config.toChain,
        toToken: config.toToken,
        toAmount: config.toAmount,
        contractCalls: [],
      };
      return getContractCallsQuote(quoteRequest);
    });

    try {
      const contractCallQuoteResponses = await Promise.allSettled(
        quoteRequests,
      );

      const successfulQuotes = contractCallQuoteResponses
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<LiFiStep>).value);

      if (successfulQuotes.length > 0) {
        setQuotes(successfulQuotes);
        console.log('===== Successful Quotes:', successfulQuotes);
      }

      const failedQuotes = contractCallQuoteResponses
        .filter((result) => result.status === 'rejected')
        .map((result) => (result as PromiseRejectedResult).reason);

      if (failedQuotes.length > 0) {
        setQuoteError({
          code: 'PARTIAL_ERROR',
          message: 'Some quotes failed to fetch.',
        });
        console.error('===== Failed Quotes:', failedQuotes);
      }
    } catch (error: any) {
      // Catch error and extract code/message
      console.error('===== quoteResponse ERROR', error);
      setQuoteError({
        code: error.code || 'UNKNOWN_ERROR',
        message:
          error.message || 'An unknown error occurred while fetching quotes.',
      });
    } finally {
      const end = Date.now();
      setQuoteFetchTime((end - start) / 1000);
      setIsLoadingQuotes(false);
    }
  };

  const executeQuote = () => {};

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <Box
        sx={{
          border: '3px solid gray',
          minHeight: '800px',
          padding: '20px',
          borderRadius: '20px',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Heading sx={{ marginBottom: '20px' }}>1. Get Balances</Heading>
            <Button
              sx={{ marginBottom: '20px' }}
              onClick={fetchBalances}
              disabled={isLoadingBalances}
            >
              {isLoadingBalances ? 'Loading Balances...' : 'Get Balances'}
            </Button>
          </Box>

          {balanceFetchTime !== null && (
            <Heading
              size="xSmall"
              sx={{ margin: '10px', color: 'base.color.accent.1' }}
            >
              Time to fetch balances:
              {' '}
              {balanceFetchTime}
              {' '}
              seconds
            </Heading>
          )}

          {balanceError && !balances && (
            <Box sx={{ backgroundColor: '#ffadad', marginTop: '10px' }}>
              <Heading size="xSmall" sx={{ margin: '10px' }}>
                {' '}
                Error Code:
                {balanceError.code}
              </Heading>
              <Body>
                Error Message:
                {balanceError.message}
              </Body>
            </Box>
          )}
        </Box>

        {balances && <Balances balances={balances} />}

        <Box>
          <Box sx={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Heading sx={{ marginBottom: '20px' }}>2. Get Quotes</Heading>
            <Button onClick={fetchQuotes} disabled={isLoadingQuotes}>
              {isLoadingQuotes ? 'Loading Quotes...' : 'Get Quotes'}
            </Button>
          </Box>
          {quoteFetchTime !== null && (
            <Heading
              size="xSmall"
              sx={{ margin: '10px', color: 'base.color.accent.1' }}
            >
              Time to fetch quotes:
              {' '}
              {quoteFetchTime}
              {' '}
              seconds
            </Heading>
          )}

          {quoteError && (
            <Box sx={{ backgroundColor: '#ffadad', marginTop: '10px' }}>
              <Heading size="xSmall" sx={{ margin: '10px' }}>
                Error Message:
                {quoteError.message}
              </Heading>
            </Box>
          )}
        </Box>

        {quotes && <Quotes quotes={quotes} />}

        <Box>
          <Box sx={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Heading sx={{ marginBottom: '20px' }}>3. Execute Quote</Heading>
            <Button onClick={executeQuote}>
              {isLoadingQuotes ? 'Loading Quotes...' : 'Get Quotes'}
            </Button>
          </Box>
        </Box>
      </Box>
    </ViewContext.Provider>
  );
}

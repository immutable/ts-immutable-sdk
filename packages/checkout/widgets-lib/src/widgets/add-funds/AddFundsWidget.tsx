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
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { Poc } from './views/poc';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  web3Provider?: Web3Provider;
};

export type PocInputs = {
  balances: { [chainId: number]: TokenAmount[] } | undefined;
  quotes: any;
};

export default function AddFundsWidget({
  web3Provider,
}: AddFundsWidgetInputs) {
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const [balances, setBalances] = useState<
  { [chainId: number]: TokenAmount[] } | undefined
  >();

  const [quotes, setQuotes] = useState<LiFiStep[] | undefined>();
  const viewReducerValues = useMemo(
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );

  useEffect(() => {
    (async () => {
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
        apiKey:
          '0809bf15-d159-42dd-b079-756d1c3b0458.d17e73a9-93fa-4d60-ac1e-a1a027425c3b',
        providers: [evmProvider],
      });

      // const chainId = 1;
      // const tokenContractAddress = '0x0000000000000000000000000000000000000000';
      // const walletAddress = await web3Provider?.getSigner().getAddress();
      // console.log('connected wallet address', walletAddress);

      const richWallet = '0xe93685f3bBA03016F02bD1828BaDD6195988D950';

      // DO WE QUERY TOKEN FROM SOMEWHERE?
      const tokensByChain = {
        1: [
          {
            chainId: 1,
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            name: 'USDC',
            decimals: 18,
            priceUSD: '0.9999',
          },
        ],
        59144: [
          {
            chainId: 59144,
            address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
            symbol: 'WETH',
            name: 'Wrapped Ether ',
            decimals: 18,
            priceUSD: '0.9999',
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
      } catch (error) {
        console.error('===== balanceResponse ERROR', error);
      }

      const configs = [
        {
          fromChain: ChainId.ETH,
          fromToken: findDefaultToken(CoinKey.USDC, ChainId.ETH).address,
          toChain: ChainId.LNA,
          toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
          toAmount: '1000000',
        },
        // {
        //   fromChain: ChainId.ETH,
        //   fromToken: findDefaultToken(CoinKey.ETH, ChainId.ETH).address,
        //   toChain: ChainId.LNA,
        //   toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
        //   toAmount: '1000000',
        // },
        // {
        //   fromChain: ChainId.MNT,
        //   fromToken: findDefaultToken(CoinKey.USDT, ChainId.MNT).address,
        //   toChain: ChainId.LNA,
        //   toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
        //   toAmount: '1000000',
        // },
        // {
        //   fromChain: ChainId.MNT,
        //   fromToken: findDefaultToken(CoinKey.WETH, ChainId.MNT).address,
        //   toChain: ChainId.LNA,
        //   toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
        //   toAmount: '1000000',
        // },
        // {
        //   fromChain: ChainId.MNT,
        //   fromToken: findDefaultToken(CoinKey.WBTC, ChainId.MNT).address,
        //   toChain: ChainId.LNA,
        //   toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
        //   toAmount: '1000000',
        // },
        // {
        //   fromChain: ChainId.CEL,
        //   fromToken: findDefaultToken(CoinKey.CELO, ChainId.CEL).address,
        //   toChain: ChainId.LNA,
        //   toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
        //   toAmount: '1000000',
        // },
        // {
        //   fromChain: ChainId.CEL,
        //   fromToken: findDefaultToken(CoinKey.WETH, ChainId.CEL).address,
        //   toChain: ChainId.LNA,
        //   toToken: findDefaultToken(CoinKey.USDC, ChainId.LNA).address,
        //   toAmount: '1000000',
        // },
      ];

      const start = Date.now();
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

      const contractCallQuoteResponses = await Promise.all(quoteRequests);

      setQuotes(contractCallQuoteResponses);

      const end = Date.now();

      console.log('Time', end - start / 1000);
      console.log(contractCallQuoteResponses);
    })();
  }, []);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      {balances && quotes && <Poc balances={balances} quotes={quotes} />}
    </ViewContext.Provider>
  );
}

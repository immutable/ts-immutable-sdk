import { Exchange } from '@imtbl/dex-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { parseUnits } from 'ethers';
import { ChainId, WrappedBrowserProvider, TokenInfo } from '@imtbl/checkout-sdk';
import { quotesProcessor } from './FetchQuote';

const overrides: any = {
  rpcURL: 'https://test',
  commonRoutingTokens: [
    {
      chainId: ChainId.SEPOLIA,
      address: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
      decimals: 18,
      symbol: 'FUN',
    },
  ],
  exchangeContracts: {
    multicall: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
  },
  nativeToken: {
    chainId: ChainId.SEPOLIA,
  },
};

describe('QuotesProcessor', () => {
  describe('processQuotes', () => {
    describe('fromAmountIn', () => {
      let exchange: Exchange;
      let getUnsignedSwapTxFromAmountIn: jest.Mock;
      let provider: WrappedBrowserProvider;
      let toToken: TokenInfo;
      let fromToken: TokenInfo;
      let fromAmount: string;

      beforeEach(() => {
        getUnsignedSwapTxFromAmountIn = jest.fn();

        exchange = new Exchange({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          baseConfig: new ImmutableConfiguration({ environment: Environment.SANDBOX }),
          overrides,
        });

        exchange.getUnsignedSwapTxFromAmountIn = getUnsignedSwapTxFromAmountIn;

        provider = {
          getSigner: () => ({
            getAddress: async () => Promise.resolve('0x123'),
          }),
          provider: {
            request: async () => null,
          },
        } as unknown as WrappedBrowserProvider;

        fromAmount = '100';
      });

      it('should call the unsigned swap transaction from amount in and get the quote', async () => {
        fromToken = {
          address: '0x124',
          decimals: 18,
          symbol: 'IMX',
          name: 'Immutable X',
        };

        toToken = {
          address: '0x125',
          decimals: 20,
          symbol: 'ETH',
          name: 'Immutable X',
        };
        await quotesProcessor.fromAmountIn(exchange, provider, fromToken, fromAmount, toToken);

        expect(getUnsignedSwapTxFromAmountIn).toHaveBeenCalledWith(
          '0x123',
          '0x124',
          '0x125',
          BigInt(parseUnits(fromAmount, fromToken.decimals)),
        );
      });
    });

    describe('fromAmountOut', () => {
      let exchange: Exchange;
      let getUnsignedSwapTxFromAmountOut: jest.Mock;
      let provider: WrappedBrowserProvider;
      let toToken: TokenInfo;
      let fromToken: TokenInfo;
      let toAmount: string;

      beforeEach(() => {
        getUnsignedSwapTxFromAmountOut = jest.fn();
        exchange = new Exchange({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          baseConfig: new ImmutableConfiguration({ environment: Environment.SANDBOX }),
          overrides,
        });
        exchange.getUnsignedSwapTxFromAmountOut = getUnsignedSwapTxFromAmountOut;

        provider = {
          getSigner: () => ({
            getAddress: async () => Promise.resolve('0x123'),
          }),
          provider: {
            request: async () => null,
          },
        } as unknown as WrappedBrowserProvider;

        toAmount = '100';
      });

      it('should call the unsigned swap transaction from amount out and get the quote', async () => {
        toToken = {
          address: '0x125',
          decimals: 20,
          symbol: 'ETH',
          name: 'Immutable X',
        };

        fromToken = {
          address: '0x124',
          decimals: 18,
          symbol: 'IMX',
          name: 'Immutable X',
        };

        await quotesProcessor.fromAmountOut(exchange, provider, toToken, toAmount, fromToken);

        expect(getUnsignedSwapTxFromAmountOut).toHaveBeenCalledWith(
          '0x123',
          '0x124',
          '0x125',
          BigInt(parseUnits(toAmount, toToken.decimals)),
        );
      });
    });
  });
});

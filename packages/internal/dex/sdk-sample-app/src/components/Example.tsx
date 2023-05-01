import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Exchange, TradeInfo } from '@imtbl/dex-sdk';
import { configuration } from '@/config/devnet';

type RouteType = {
  fee: any;
  token0: string;
  token1: string;
};

export function Example() {
  // Create and use the exchange as per normal
  const exchange = new Exchange(configuration);
  const DEVNET_USDC = '0xBB587517EC25e545F8Fe7c450161319c35677C86';
  const DEVNET_FUN = '0x1a4B77b638d55f320e0a453394EC18Ab69F762F2';

  const [result, setResult] = useState<TradeInfo>();
  const [isFetching, setIsFetching] = useState(false);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [inputTokenSymbol, setInputTokenSymbol] = useState('');
  const [outputTokenSymbol, setOutputTokenSymbol] = useState('');

  const inputToken = DEVNET_USDC;
  const outputToken = DEVNET_FUN;

  const amountIn = ethers.utils.parseEther('1000');

  // useEffect(() => {
  //   getTokenSymbol(inputToken).then((symbol: string) => {
  //     setInputTokenSymbol(symbol);
  //   });
  //
  //   getTokenSymbol(outputToken).then((symbol: string) => {
  //     setOutputTokenSymbol(symbol);
  //   });
  // });
  //
  // async function getTokenSymbol(tokenAddress: string): Promise<string> {
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     RPC_URLS[SupportedChainId.POLYGON_ZKEVM_TESTNET][0]
  //   );
  //   const symbolFunctionSig = ethers.utils.id('symbol()').substring(0, 10);
  //   const returnValue = await provider.call({
  //     to: tokenAddress,
  //     data: symbolFunctionSig,
  //   });
  //   return ethers.utils.defaultAbiCoder.decode(['string'], returnValue)[0];
  // }

  async function getPaths(trade: TradeInfo): Promise<RouteType[]> {
    const promises = trade.route.pools.map(async ({ fee, token0, token1 }) => {
      // const token0Symbol = await getTokenSymbol(token0.address);
      // const token1Symbol = await getTokenSymbol(token1.address);

      const token0Symbol = 'IMZ';
      const token1Symbol = 'ETH';

      console.log({ token0Symbol, token1Symbol });
      return {
        fee,
        token0: token0Symbol,
        token1: token1Symbol,
      };
    });

    return Promise.all(promises);
  }

  const getQuote = async () => {
    setRoutes([]);
    setResult(undefined);
    setIsFetching(true);

    const result = await exchange.getQuoteFromAmountIn(
      inputToken,
      outputToken,
      amountIn
    );
    console.log({ result });

    // if (result?.state == TradeState.VALID) {
    //   setResult(result.trade);
    //
    //   const mapping = await getPaths(result.trade);
    //   setRoutes(mapping);
    // }

    setIsFetching(false);
  };

  // if (!inputTokenSymbol || !outputTokenSymbol) {
  //   return null;
  // }

  return (
    <div>
      <h3>
        Input Token: {inputTokenSymbol} - {inputToken}
      </h3>
      <h3>
        Output Token: {outputTokenSymbol} - {outputToken}
      </h3>
      <h3>Amount In: {ethers.utils.formatEther(amountIn)}</h3>
      <button
        className="disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        onClick={async () => await getQuote()}
        disabled={isFetching}
      >
        GET QUOTE
      </button>
      <hr className="my-4" />
      {result && (
        <h3>Amount out: {ethers.utils.formatEther(result.amountOut)}</h3>
      )}
      {routes.length > 0 && (
        <h3>
          {routes.map((route: any, index: number) => {
            const key = `${route.token0}-${route.token1}-${route.fee}`;
            return (
              <span key={key}>
                {route.token0}/{route.token1} - {route.fee / 10000}%{' '}
                {index !== routes.length - 1 ? `--->` : ''}{' '}
              </span>
            );
          })}
        </h3>
      )}
    </div>
  );
}

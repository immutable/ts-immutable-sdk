import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Exchange, TradeInfo } from '@imtbl/dex-sdk';
import { configuration } from '@/config/devnet';
import { Simulate } from 'react-dom/test-utils';
import input = Simulate.input;

type RouteType = {
  fee: any;
  token0: string;
  token1: string;
};

export function Example() {
  // Create and use the exchange as per normal
  const exchange = new Exchange(configuration);
  const DEVNET_USDC = process.env.NEXT_PUBLIC_COMMON_ROUTING_USDC || '';
  const DEVNET_FUN = process.env.NEXT_PUBLIC_COMMON_ROUTING_FUN || '';
  const DEVNET_ETH = process.env.NEXT_PUBLIC_COMMON_ROUTING_WETH || '';

  type mapping = {
    [address: string]: string;
  };

  const [result, setResult] = useState<TradeInfo | null>();
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [addressToSymbolMapping, setAddressToSymbolMapping] = useState<mapping>(
    {}
  );

  const inputToken = DEVNET_FUN;
  const outputToken = DEVNET_ETH;

  const amountIn = ethers.utils.parseEther('1000');

  useEffect(() => {
    Promise.all([getTokenSymbol(inputToken), getTokenSymbol(outputToken)]).then(
      ([inputTokenSymbol, outputTokenSymbol]) => {
        console.log(inputTokenSymbol, outputTokenSymbol);
        setAddressToSymbolMapping({
          [inputToken]: inputTokenSymbol,
          [outputToken]: outputTokenSymbol,
        });
        console.log(inputTokenSymbol);
      }
    );
  }, []);

  async function getTokenSymbol(tokenAddress: string): Promise<string> {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL_DEV
    );
    const symbolFunctionSig = ethers.utils.id('symbol()').substring(0, 10);
    const returnValue = await provider.call({
      to: tokenAddress,
      data: symbolFunctionSig,
    });
    return ethers.utils.defaultAbiCoder.decode(['string'], returnValue)[0];
  }

  async function getPaths(trade: TradeInfo): Promise<RouteType[]> {
    const promises = trade.route.pools.map(async ({ fee, token0, token1 }) => {
      const token0Symbol = await getTokenSymbol(token0.address);
      const token1Symbol = await getTokenSymbol(token1.address);

      if (!addressToSymbolMapping[token0.address]) {
        setAddressToSymbolMapping({
          ...addressToSymbolMapping,
          [token0.address]: token0Symbol,
        });
      }

      if (!addressToSymbolMapping[token1.address]) {
        setAddressToSymbolMapping({
          ...addressToSymbolMapping,
          [token1.address]: token1Symbol,
        });
      }

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

    if (result.success) {
      setResult(result.trade);

      const mapping = await getPaths(result.trade);
      setRoutes(mapping);
    } else {
      setError('Error fetching the quotes...');
      setResult(null);
      setRoutes([]);
    }

    setIsFetching(false);
  };

  return (
    <div>
      <h3>
        Input Token: {inputToken} ({addressToSymbolMapping[inputToken]})
      </h3>
      <h3>
        Output Token: {outputToken} ({addressToSymbolMapping[outputToken]})
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
        <>
          <h3>Amount out: {ethers.utils.formatEther(result.amountOut)}</h3>
          {routes.length > 0 && (
            <>
              <h3>
                Token Path:&nbsp;
                {result.route.tokenPath.map((token: any, index: number) => {
                  const key = token.address;
                  return (
                    <span key={key}>
                      {addressToSymbolMapping[token.address]}{' '}
                      {index !== result.route.tokenPath.length - 1
                        ? `--->`
                        : ''}{' '}
                    </span>
                  );
                })}
              </h3>
              <h3>
                Pools used:&nbsp;
                {routes.map((route: any, index: number) => {
                  const key = `${route.token0}-${route.token1}-${route.fee}`;
                  return (
                    <span key={key}>
                      ({route.token0}/{route.token1} - {route.fee / 10000}%){' '}
                      {index !== routes.length - 1 ? `--->` : ''}{' '}
                    </span>
                  );
                })}
              </h3>
            </>
          )}
        </>
      )}
    </div>
  );
}

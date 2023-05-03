import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Exchange, TradeInfo } from '@imtbl/dex-sdk';
import { configuration } from '@/config/devnet';
import { getERC20ApproveCalldata } from '@/utils/approve';

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
  const [isMetamaskInstalled, setIsMetamaskInstalled] =
    useState<boolean>(false);
  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null);
  const [result, setResult] = useState<TradeInfo | null>();
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [addressToSymbolMapping, setAddressToSymbolMapping] = useState<mapping>(
    {}
  );
  const [approved, setApproved] = useState<boolean>(false);
  const [swapStatus, setSwapStatus] = useState<boolean>(false);

  const inputToken = DEVNET_FUN;
  const outputToken = DEVNET_ETH;

  const amountIn = ethers.utils.parseEther('1000');

  useEffect(() => {
    if ((window as any).ethereum) {
      //check if Metamask wallet is installed
      setIsMetamaskInstalled(true);
    }
  }, []);

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

  //Does the User have an Ethereum wallet/account?
  async function connectMetamaskWallet(): Promise<void> {
    //to get around type checking
    (window as any).ethereum
      .request({
        method: 'eth_requestAccounts',
      })
      .then((accounts: string[]) => {
        setEthereumAccount(accounts[0]);
      })
      .catch((error: any) => {
        alert(`Something went wrong: ${error}`);
      });
  }

  if (ethereumAccount === null) {
    return (
      <div className="App App-header">
        {isMetamaskInstalled ? (
          <div>
            <button
              className="disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              onClick={connectMetamaskWallet}
            >
              Connect Your Metamask Wallet
            </button>
          </div>
        ) : (
          <p>Install Your Metamask wallet</p>
        )}
      </div>
    );
  }

  type mapping = {
    [address: string]: string;
  };

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

  const performSwap = async (result: any) => {
    setIsFetching(true);
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL_DEV
    );

    const quote = await exchange.getUnsignedSwapTxFromAmountIn(
      ethereumAccount,
      inputToken,
      outputToken,
      amountIn
    );

    if (!approved) {
      const approveCalldata = getERC20ApproveCalldata();
      const transactionRequest = {
        data: approveCalldata,
        to: DEVNET_FUN,
        value: '0',
        from: ethereumAccount,
      };
      try {
        const approveReceipt = await (window as any).ethereum.send(
          'eth_sendTransaction',
          [transactionRequest]
        );
        console.log({ approveReceipt });
        await provider.waitForTransaction(approveReceipt.result, 1, 150000);
        setApproved(true);
      } catch (e) {
        console.error(e);
        setIsFetching(false);
        return;
      }
    }

    try {
      const receipt = await (window as any).ethereum.send(
        'eth_sendTransaction',
        [quote.transactionRequest]
      );
      await provider.waitForTransaction(receipt.result, 1, 150000);
    } catch (e) {
      console.error(e);
      setIsFetching(false);
      return;
    }

    setIsFetching(false);
    setSwapStatus(true);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '12px' }}>
        Your wallet address: {ethereumAccount}
      </h3>
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

              <button
                className="disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                onClick={() => performSwap(result)}
                disabled={isFetching}
              >
                {approved ? 'Swap' : 'Approve'}
              </button>
              {isFetching && <h3>loading...</h3>}
              {swapStatus && (
                <h3 style={{ marginTop: '12px' }}>
                  Swap successful! Check your metamask activity to see updated
                  balances
                </h3>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

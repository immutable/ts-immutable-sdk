import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Exchange, TransactionResponse } from '@imtbl/dex-sdk';
import { configuration } from '../config';
import { getERC20ApproveCalldata } from '@/utils/approve';
import { ConnectAccount } from './ConnectAccount';
import { getTokenSymbol } from '../utils/getTokenSymbol';
import { AmountInput } from './AmountInput';

export function Example() {
  // Create the Exchange class
  const exchange = new Exchange(configuration);

  // Instead of hard-coding these tokens, you can optionally retrieve available tokens from the user's wallet
  const FUN_TOKEN = process.env.NEXT_PUBLIC_COMMON_ROUTING_FUN || '';
  const WETH_TOKEN = process.env.NEXT_PUBLIC_COMMON_ROUTING_WETH || '';

  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [swapStatus, setSwapStatus] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);
  const [result, setResult] = useState<TransactionResponse | null>();
  const [error, setError] = useState<string | null>(null);
  const [addressToSymbolMapping, setAddressToSymbolMapping] = useState<mapping>(
    {}
  );

  const inputToken = FUN_TOKEN;
  const outputToken = WETH_TOKEN;

  useEffect(() => {
    // Get the symbols for the tokens that we want to swap so we can display this to the user
    Promise.all([getTokenSymbol(inputToken), getTokenSymbol(outputToken)]).then(
      ([inputTokenSymbol, outputTokenSymbol]) => {
        setAddressToSymbolMapping({
          [inputToken]: inputTokenSymbol,
          [outputToken]: outputTokenSymbol,
        });
      }
    );
  }, [inputToken, outputToken]);

  if (ethereumAccount === null) {
    return <ConnectAccount setAccount={setEthereumAccount} />;
  }

  type mapping = {
    [address: string]: string;
  };

  const getQuote = async () => {
    setIsFetching(true);

    try {
      const txn = await exchange.getUnsignedSwapTxFromAmountIn(
        ethereumAccount,
        inputToken,
        outputToken,
        ethers.utils.parseEther(`${inputAmount}`)
      );

      setResult(txn);
    } catch(e: any) {
      setError(`Error fetching quote: ${e.message}`);
      setResult(null);
    }

    setIsFetching(false);
  };

  const performSwap = async (result: TransactionResponse) => {
    setSwapStatus(false);
    setIsFetching(true);
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );

    // Approve the ERC20 spend
    if (!approved) {
      const inputBigNumber = ethers.utils.parseUnits(
        inputAmount,
        result.info?.quote.token.decimals
      );
      const approveCalldata = getERC20ApproveCalldata(inputBigNumber);
      const transactionRequest = {
        data: approveCalldata,
        to: inputToken,
        value: '0',
        from: ethereumAccount,
      };
      try {
        // Send the Approve transaction
        const approveReceipt = await (window as any).ethereum.send(
          'eth_sendTransaction',
          [transactionRequest]
        );

        // Wait for the Approve transaction to complete
        await provider.waitForTransaction(approveReceipt.result, 1, 500000);
        setApproved(true);
      } catch (e: any) {
        alert(e.message);
        setIsFetching(false);
        return;
      }
    }

    try {
      // Send the Swap transaction
      const receipt = await (window as any).ethereum.send(
        'eth_sendTransaction',
        [result.transaction]
      );

      // Wait for the Swap transaction to complete
      await provider.waitForTransaction(receipt.result, 1, 500000);
      setIsFetching(false);
      setSwapStatus(true);
    } catch (e: any) {
      alert(e.message);
      setIsFetching(false);
      setSwapStatus(false);
      return;
    }
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

      <AmountInput
        inputTokenSymbol={addressToSymbolMapping[inputToken]}
        setInputAmount={setInputAmount}
      />

      <button
        className="disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        onClick={async () => await getQuote()}
        disabled={isFetching}
      >
        Get Quote
      </button>

      <hr className="my-4" />
      {result && result.info && (
        <>
          <h3>
            Expected amount:{' '}
            {ethers.utils.formatEther(result.info.quote.amount)}{' '}
            {`${addressToSymbolMapping[result.info.quote.token.address]}`}
          </h3>
          <h3>
            Minimum amount:{' '}
            {ethers.utils.formatEther(result.info.quoteWithMaxSlippage.amount)}{' '}
            {`${
              addressToSymbolMapping[
                result.info.quoteWithMaxSlippage.token.address
              ]
            }`}
          </h3>
          <h3>Slippage: {result.info.slippage}</h3>
            <>
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
                  Swap successful! Check your metamask to see updated token
                  balances
                </h3>
              )}
              {error && <Error message={error} />}
            </>
        </>
      )}
    </div>
  );
}

const Error = ({ message }: { message: string }) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

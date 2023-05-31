import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Exchange, TransactionResponse } from '@imtbl/dex-sdk';
import { configuration } from '../config';
import { ConnectAccount } from './ConnectAccount';
import { getTokenSymbol } from '../utils/getTokenSymbol';
import { AmountInput } from './AmountInput';

export function Example() {
  // Create the Exchange class
  const exchange = new Exchange(configuration);

  // Instead of hard-coding these tokens, you can optionally retrieve available tokens from the user's wallet
  const FUN_TOKEN = process.env.NEXT_PUBLIC_COMMON_ROUTING_FUN || '';
  const USDC_TOKEN = process.env.NEXT_PUBLIC_COMMON_ROUTING_USDC || '';

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
  const outputToken = USDC_TOKEN;

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
    setError(null)

    try {
      const txn = await exchange.getUnsignedSwapTxFromAmountIn(
        ethereumAccount,
        inputToken,
        outputToken,
        ethers.utils.parseEther(`${inputAmount}`)
      );

      setResult(txn);

      if (!txn.approveTransaction) {
        setApproved(true)
      }
    } catch(e) {
      const message =  e instanceof Error ? e.message : 'Unknown Error';
      setError(`Error fetching quote: ${message}`);
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
      try {
        // Send the Approve transaction
        const approveReceipt = await (window as any).ethereum.send(
          'eth_sendTransaction',
          [result.approveTransaction]
        );

        // Wait for the Approve transaction to complete
        await provider.waitForTransaction(approveReceipt.result, 1);
        setApproved(true);
      } catch (e) {
        const message =  e instanceof Error ? e.message : 'Unknown Error';
        alert(message);
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
      await provider.waitForTransaction(receipt.result, 1);
      setIsFetching(false);
      setSwapStatus(true);
    } catch (e) {
      const message =  e instanceof Error ? e.message : 'Unknown Error';
      alert(message);
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
      {error && <ErrorMessage message={error} />}
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
          <h3>Slippage: {result.info.slippage}%</h3>
          <h3>Gas estimate: {result.info.gasFeeEstimate ? `${ethers.utils.formatEther(result.info.gasFeeEstimate?.amount)} IMX` : 'No gas estimate available'}</h3>
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
            </>
        </>
      )}
    </div>
  );
}

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

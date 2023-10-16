import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Exchange, TransactionDetails, TransactionResponse } from '@imtbl/dex-sdk';
import { configuration } from '../config';
import { ConnectAccount } from './ConnectAccount';
import { getTokenSymbol } from '../utils/getTokenSymbol';
import { AmountInput } from './AmountInput';
import { SecondaryFeeInput } from './SecondaryFeeInput';
import { FeeBreakdown } from './FeeBreakdown';

type mapping = {
  [address: string]: string;
};

export function Example() {
  // Instead of hard-coding these tokens, you can optionally retrieve available tokens from the user's wallet
  const TEST_IMX_TOKEN = '0x0000000000000000000000000000000000001010';
  const ZKCATS_TOKEN = '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2';

  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [swapTransaction, setSwapTransaction] = useState<ethers.providers.TransactionReceipt | null>(null);
  const [approved, setApproved] = useState<boolean>(false);
  const [result, setResult] = useState<TransactionResponse | null>();
  const [error, setError] = useState<string | null>(null);
  const [secondaryFeeRecipient, setSecondaryFeeRecipient] = useState<string>('');
  const [secondaryFeePercentage, setFeePercentage] = useState<number>(0);
  const [addressToSymbolMapping, setAddressToSymbolMapping] = useState<mapping>(
    {}
  );

  const inputToken = TEST_IMX_TOKEN;
  const outputToken = ZKCATS_TOKEN;

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

  const getQuote = async () => {
    setIsFetching(true);
    setError(null)

    try {
      let exchange: Exchange;
      if (secondaryFeeRecipient && secondaryFeePercentage) {
        exchange = new Exchange({...configuration, secondaryFees: [{recipient: secondaryFeeRecipient, basisPoints: secondaryFeePercentage * 100}]});
      } else {
        exchange = new Exchange(configuration);
      }

      const txn = await exchange.getUnsignedSwapTxFromAmountIn(
        ethereumAccount,
        inputToken,
        outputToken,
        ethers.utils.parseEther(`${inputAmount}`)
      );

      setResult(txn);

      if (!txn.approval) {
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
    setSwapTransaction(null);
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
          [result.approval?.transaction]
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
        [result.swap.transaction]
      );

      // Wait for the Swap transaction to complete
      const tx = await provider.waitForTransaction(receipt.result, 1);
      setIsFetching(false);
      setSwapTransaction(tx);
    } catch (e) {
      const message =  e instanceof Error ? e.message : 'Unknown Error';
      alert(message);
      setIsFetching(false);
      setSwapTransaction(null);
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

      <hr className="my-4" />

      <SecondaryFeeInput setSecondaryFeeRecipient={setSecondaryFeeRecipient} setFeePercentage={setFeePercentage}/>
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
      {result && (
        <>
          <h3>
            Expected amount:{' '}
            {ethers.utils.formatEther(result.quote.amount.value)}{' '}
            {`${addressToSymbolMapping[result.quote.amount.token.address]}`}
          </h3>
          <h3>
            Minimum amount:{' '}
            {ethers.utils.formatEther(result.quote.amountWithMaxSlippage.value)}{' '}
            {`${
              addressToSymbolMapping[
                result.quote.amountWithMaxSlippage.token.address
              ]
            }`}
          </h3>

          <h3>Slippage: {result.quote.slippage}%</h3>
          {result.approval && <h3>Approval Gas Estimate: {showGasEstimate(result.approval)}</h3>}
          <h3>Swap Gas estimate: {showGasEstimate(result.swap)}</h3>

          <FeeBreakdown fees={result.quote.fees} addressMap={addressToSymbolMapping} />

            <>
              <button
                className="disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                onClick={() => performSwap(result)}
                disabled={isFetching}
              >
                {approved ? 'Swap' : 'Approve'}
              </button>
              {isFetching && <h3>loading...</h3>}
              {swapTransaction && (
                <>
                  <h3 style={{ marginTop: '12px' }}>
                    Swap successful! Check your metamask to see updated token
                    balances
                  </h3>
                  <a  
                  className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'
                  href={`https://explorer.testnet.immutable.com/tx/${swapTransaction.transactionHash}`} target='_blank'>Transaction</a>
                </>
              )}
            </>
        </>
      )}
    </div>
  );
}

const showGasEstimate = (txn: TransactionDetails) => txn.gasFeeEstimate ? `${ethers.utils.formatEther(txn.gasFeeEstimate.value)} IMX` : 'No gas estimate available';

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

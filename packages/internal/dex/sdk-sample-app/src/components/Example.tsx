import { useState } from 'react';
import { Exchange, TransactionDetails, TransactionResponse } from '@imtbl/dex-sdk';
import { configuration } from '../config';
import { ConnectAccount } from './ConnectAccount';
import { AmountInput, AmountOutput } from './AmountInput';
import { SecondaryFeeInput } from './SecondaryFeeInput';
import { FeeBreakdown } from './FeeBreakdown';
import { BrowserProvider, formatEther, parseEther, TransactionReceipt } from 'ethers';

type Token = {
  symbol: string;
  address: string;
};

type TradeType = 'exactInput' | 'exactOutput';

type mapping = {
  [address: string]: string;
};

const mainnetTokens: Token[] = [
  { symbol: 'IMX', address: 'native' },
  { symbol: 'ETH', address: '0x52a6c53869ce09a731cd772f245b97a4401d3348' },
  { symbol: 'USDC', address: '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2' },
];

const testnetTokens: Token[] = [
  { symbol: 'IMX', address: 'native' },
  { symbol: 'WIMX', address: '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439' },
  { symbol: 'zkTDR', address: '0x6531F7B9158d78Ca78b46799c4Fd65C2Af8Ae506' },
  { symbol: 'zkPSP', address: '0x88B35dF96CbEDF2946586147557F7D5D0CCE7e5c' },
  { symbol: 'zkWLT', address: '0x8A5b0470ee48248bEb7D1E745c1EbA0DCA77215e' },
  { symbol: 'zkSRE', address: '0x43566cAB87CC147C95e2895E7b972E19993520e4' },
  { symbol: 'zkCORE', address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E' },
  { symbol: 'zkWAT', address: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2' },
  { symbol: 'zkCATS', address: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c' },
  { symbol: 'zkYEET', address: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e' },
];

/// @dev Update this to change tokens used in the app
const allTokens = testnetTokens;

const buildExchange = (secondaryFeeRecipient: string, secondaryFeePercentage: number) => {
  if (secondaryFeeRecipient && secondaryFeePercentage) {
    return new Exchange({
      ...configuration,
      secondaryFees: [
        {
          recipient: secondaryFeeRecipient,
          basisPoints: secondaryFeePercentage * 100,
        },
      ],
    });
  }

  return new Exchange(configuration);
};

export function Example() {
  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [outputAmount, setOutputAmount] = useState<string>('0');
  const [swapTransaction, setSwapTransaction] = useState<TransactionReceipt | null>(null);
  const [approved, setApproved] = useState<boolean>(false);
  const [result, setResult] = useState<TransactionResponse | null>();
  const [error, setError] = useState<string | null>(null);
  const [secondaryFeeRecipient, setSecondaryFeeRecipient] = useState<string>('');
  const [secondaryFeePercentage, setFeePercentage] = useState<number>(0);

  const [tradeType, setTradeType] = useState<TradeType>('exactInput');
  const [inputToken, setInputToken] = useState<Token>(allTokens[0]);
  const [outputToken, setOutputToken] = useState<Token>(allTokens[1]);

  const addressToSymbolMapping = allTokens.reduce((acc, token) => {
    acc[token.address] = token.symbol!;
    return acc;
  }, {} as mapping);

  if (ethereumAccount === null) {
    return <ConnectAccount setAccount={setEthereumAccount} />;
  }

  const getQuote = async (tokenInAddress: string, tokenOutAddress: string) => {
    setIsFetching(true);
    setError(null);
    setApproved(false);

    try {
      const exchange = buildExchange(secondaryFeeRecipient, secondaryFeePercentage);

      const txn =
        tradeType === 'exactInput'
          ? await exchange.getUnsignedSwapTxFromAmountIn(
              ethereumAccount,
              tokenInAddress,
              tokenOutAddress,
              parseEther(`${inputAmount}`),
            )
          : await exchange.getUnsignedSwapTxFromAmountOut(
              ethereumAccount,
              tokenInAddress,
              tokenOutAddress,
              parseEther(`${outputAmount}`),
            );

      setResult(txn);

      if (!txn.approval) {
        setApproved(true);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error';
      setError(`Error fetching quote: ${message}`);
      setResult(null);
    }

    setIsFetching(false);
  };

  const performSwap = async (result: TransactionResponse) => {
    setSwapTransaction(null);
    setIsFetching(true);
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    // Approve the ERC20 spend
    if (!approved) {
      try {
        // Send the Approve transaction
        const approveReceipt = await signer.sendTransaction(result.approval!.transaction);

        // Wait for the Approve transaction to complete
        await provider.waitForTransaction(approveReceipt.hash, 1);
        setApproved(true);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown Error';
        alert(message);
        setIsFetching(false);
        return;
      }
    }

    try {
      // Send the Swap transaction
      const receipt = await signer.sendTransaction(result.swap.transaction);
      console.log({ receipt });

      // Wait for the Swap transaction to complete
      const tx = await provider.waitForTransaction(receipt.hash, 1);
      setIsFetching(false);
      setSwapTransaction(tx);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error';
      alert(message);
      setIsFetching(false);
      setSwapTransaction(null);
      return;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '12px' }}>Your wallet address: {ethereumAccount}</h3>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: 150 }}>
          <h3>Swap Type</h3>
        </div>
        <div>
          <select
            className='dark:bg-slate-800'
            value={tradeType}
            onChange={(e) => {
              setTradeType(e.target.value as TradeType);
              setResult(null);
              setSwapTransaction(null);
            }}>
            <option>exactInput</option>
            <option>exactOutput</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: 150 }}>
          <h3>Input Token:</h3>
        </div>
        <div>
          <select
            className='dark:bg-slate-800'
            value={inputToken.address}
            onChange={(e) => {
              setInputToken({
                address: e.target.value,
                symbol: addressToSymbolMapping[e.target.value],
              });
              setResult(null);
              setSwapTransaction(null);
            }}>
            {allTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: 150 }}>
          <h3>Output Token:</h3>
        </div>
        <div>
          <select
            className='dark:bg-slate-800'
            value={outputToken.address}
            onChange={(e) => {
              setOutputToken({
                address: e.target.value,
                symbol: addressToSymbolMapping[e.target.value],
              });
              setResult(null);
              setSwapTransaction(null);
            }}>
            {allTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className='my-4' />

      <SecondaryFeeInput setSecondaryFeeRecipient={setSecondaryFeeRecipient} setFeePercentage={setFeePercentage} />
      {tradeType === 'exactInput' && inputToken && (
        <AmountInput tokenSymbol={inputToken.symbol} setAmount={setInputAmount} />
      )}
      {tradeType === 'exactOutput' && outputToken && (
        <AmountOutput tokenSymbol={outputToken.symbol} setAmount={setOutputAmount} />
      )}

      {inputToken && outputToken && (
        <button
          className='disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
          onClick={() => getQuote(inputToken.address, outputToken.address)}
          disabled={isFetching}>
          Get Quote
        </button>
      )}

      <hr className='my-4' />
      {error && <ErrorMessage message={error} />}
      {result && (
        <>
          <h3>
            Expected amount: {formatEther(result.quote.amount.value)}{' '}
            {`${addressToSymbolMapping[result.quote.amount.token.address]}`}
          </h3>
          <h3>
            {tradeType === 'exactInput' ? 'Minimum' : 'Maximum'} amount:{' '}
            {formatEther(result.quote.amountWithMaxSlippage.value)}{' '}
            {`${addressToSymbolMapping[result.quote.amountWithMaxSlippage.token.address]}`}
          </h3>

          <h3>Slippage: {result.quote.slippage}%</h3>
          {result.approval && <h3>Approval Gas Estimate: {showGasEstimate(result.approval)}</h3>}
          <h3>Swap Gas estimate: {showGasEstimate(result.swap)}</h3>

          <FeeBreakdown fees={result.quote.fees} addressMap={addressToSymbolMapping} />

          <>
            <button
              className='disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
              onClick={() => performSwap(result)}
              disabled={isFetching}>
              {approved ? 'Swap' : 'Approve'}
            </button>
            {isFetching && <h3>loading...</h3>}
            {swapTransaction && (
              <>
                <h3 style={{ marginTop: '12px' }}>
                  Swap successful! Check your metamask to see updated token balances
                </h3>
                <a
                  className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'
                  href={`https://explorer.testnet.immutable.com/tx/${swapTransaction.hash}`}
                  target='_blank'>
                  Transaction
                </a>
              </>
            )}
          </>
        </>
      )}
    </div>
  );
}

const showGasEstimate = (txn: TransactionDetails) =>
  txn.gasFeeEstimate ? `${formatEther(txn.gasFeeEstimate.value)} IMX` : 'No gas estimate available';

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

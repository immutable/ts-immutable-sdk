/* eslint-disable no-console */
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { useCallback, useState } from 'react';

export type ExecuteQuoteInput = {
  provider: Web3Provider | undefined;
  txnRequest: TransactionRequest | undefined;
};

export const useExecuteQuote = (input: ExecuteQuoteInput) => {
  const { provider, txnRequest } = input;
  console.log('=== txnRequest', txnRequest);

  const [executeResponse, setExecuteResponse] = useState<string | undefined>(undefined);
  const [executeError, setExecuteError] = useState<Error | undefined>(undefined);

  const sendTransaction = useCallback(async (txn: TransactionRequest) : Promise<string | undefined | Error> => {
    console.log('@@@@ provider', provider);
    try {
      const signer = provider?.getSigner();
      const txnResponse = await signer?.sendTransaction(txn);
      console.log('=== txnResponse', txnResponse);

      await txnResponse?.wait();
      const transactionHash = txnResponse?.hash;
      console.log('=== transactionHash', transactionHash);

      setExecuteResponse(transactionHash);
      return transactionHash;
    } catch (error) {
      console.error('=== error', error);
      setExecuteError(error as Error);
      return error as Error;
    }
  }, [provider]);

  return { executeResponse, executeError, sendTransaction };
};

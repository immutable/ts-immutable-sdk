/* eslint-disable no-console */
import { Web3Provider } from '@ethersproject/providers';
import { useCallback, useState } from 'react';
import {
  LiFiStep,
} from '@lifi/sdk';
import { ChainId, ERC20ABI } from '@imtbl/checkout-sdk';
import { BigNumber, Contract } from 'ethers';

export type ExecuteQuoteInput = {
  provider: Web3Provider | undefined;
  quote: LiFiStep | undefined;
};

export const useExecuteQuote = (input: ExecuteQuoteInput) => {
  const { provider, quote } = input;
  console.log('=== txnRequest', quote?.transactionRequest);

  const [executeResponse, setExecuteResponse] = useState<string | undefined>(undefined);
  const [executeError, setExecuteError] = useState<Error | undefined>(undefined);

  const checkAllowanceAndApprove = useCallback(async (tokenAddress: string, spender: string, amount: BigNumber) => {
    if (!provider) return;

    const signer = provider?.getSigner();
    const tokenContract = new Contract(tokenAddress, JSON.stringify(ERC20ABI), signer);

    console.log('=== tokenContract', tokenContract);

    try {
      const address = (await signer?.getAddress()) || '';
      const currentAllowance: BigNumber = await tokenContract.allowance(address, spender);
      console.log('==== current allowance:', currentAllowance.toString());

      if (currentAllowance.lt(amount)) {
        const approveTx = await tokenContract.approve(spender, amount);

        await approveTx.wait();

        console.log(`Approval successful: ${approveTx.hash}`);
      } else {
        console.log('!!! Sufficient allowance already granted');
      }
    } catch (error: any) {
      console.log('Approval error:', error);
    }
  }, [provider]);

  const executeFlow = useCallback(async () : Promise<string | undefined | Error> => {
    if (!provider || !quote) return '';

    console.log('@@@@ provider', provider);
    console.log('@@@@ quote', quote);

    try {
      const chainID = quote?.transactionRequest?.chainId;
      console.log('==== chainID', chainID);
      const chainHex = `0x${chainID?.toString(16)}`;
      console.log('==== chainHex', chainHex);

      const sepoliaChain = `0x${ChainId.SEPOLIA.toString(16)}`;
      console.log('=== sepoliaChain', sepoliaChain);

      const signer = provider?.getSigner();
      // 1. Change Chain
      provider?.provider.request!({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: chainHex,
          },
        ],
      });

      // 2. Approval
      const tokenAddress = quote?.action.fromToken.address || '';
      const spender = quote?.transactionRequest?.to || '';
      const amount = BigNumber.from(quote?.action?.fromAmount);

      console.log('=== tokenAddress', tokenAddress);
      console.log('=== spender', spender);
      console.log('=== transaction Request Value', amount);
      console.log('=== amount toString', amount.toString());
      console.log('=== amount toNumber', amount.toNumber());

      const approveTxn = await checkAllowanceAndApprove(tokenAddress, spender, amount);
      console.log('=== approveTxn', approveTxn);
      const txnResponse = await signer?.sendTransaction(quote?.transactionRequest!);
      console.log('=== EXECUTE txnResponse', txnResponse);

      await txnResponse?.wait();
      const transactionHash = txnResponse?.hash;
      console.log('=== EXECUTE transactionHash', transactionHash);

      setExecuteResponse(transactionHash);

      return transactionHash;
    } catch (error) {
      console.error('=== error', error);
      setExecuteError(error as Error);

      return error as Error;
    }
  }, [provider, quote]);

  return { executeResponse, executeError, executeFlow };
};

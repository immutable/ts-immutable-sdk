/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useState } from 'react';

import { Environment } from '@imtbl/config';
import {
  SignResponse,
  SignOrderInput,
  PaymentTypes,
  SignOrderError,
  ExecuteOrderResponse,
  ExecutedTransaction,
  SaleErrorTypes,
  SignApiRequest,
  SignCurrencyFilter,
  SignApiError,
} from '../types';
import { toSignResponse } from '../functions/utils';

const PRIMARY_SALES_API_BASE_URL = {
  [Environment.SANDBOX]:
    'https://api.sandbox.immutable.com/v1/primary-sales',
  [Environment.PRODUCTION]:
    'https://api.immutable.com/v1/primary-sales',
};

export const useSignOrder = (input: SignOrderInput) => {
  const {
    provider,
    items,
    fromContractAddress,
    recipientAddress,
    env,
    environmentId,
  } = input;
  const [signError, setSignError] = useState<SignOrderError | undefined>(
    undefined,
  );
  const [signResponse, setSignResponse] = useState<SignResponse | undefined>(
    undefined,
  );
  const [executeResponse, setExecuteResponse] = useState<ExecuteOrderResponse>({
    done: false,
    transactions: [],
  });

  const setExecuteTransactions = (transaction: ExecutedTransaction) => {
    setExecuteResponse((prev) => ({ ...prev, transactions: [...prev.transactions, transaction] }));
  };

  const setExecuteDone = () => setExecuteResponse((prev) => ({ ...prev, done: true }));

  const sendTransaction = useCallback(
    async (
      to: string,
      data: string,
      gasLimit: number,
      method: string,
    ): Promise<string | undefined> => {
      let transactionHash: string | undefined;

      try {
        const signer = provider?.getSigner();
        const gasPrice = await provider?.getGasPrice();
        const txnResponse = await signer?.sendTransaction({
          to,
          data,
          gasPrice,
          gasLimit,
        });

        setExecuteTransactions({ method, hash: txnResponse?.hash });
        await txnResponse?.wait(1);

        transactionHash = txnResponse?.hash;
        return transactionHash;
      } catch (e) {
        // TODO: check error type to send
        // SaleErrorTypes.WALLET_REJECTED or SaleErrorTypes.WALLET_REJECTED_NO_FUNDS

        const reason = typeof e === 'string' ? e : (e as any).reason || '';
        let errorType = SaleErrorTypes.TRANSACTION_FAILED;

        if (reason.includes('rejected') && reason.includes('user')) {
          errorType = SaleErrorTypes.WALLET_REJECTED;
        }

        if (
          reason.includes('failed to submit')
          && reason.includes('highest gas limit')
        ) {
          errorType = SaleErrorTypes.WALLET_REJECTED_NO_FUNDS;
        }

        setSignError({
          type: errorType,
          data: { error: e },
        });
        return undefined;
      }
    },
    [provider],
  );

  const expirePrevSignedOrder = useCallback(async () => {
    const reference = signResponse?.transactions
      .find((txn) => txn.methodCall.startsWith('execute'))?.params.reference;

    if (!reference) return;

    try {
      const baseUrl = `${PRIMARY_SALES_API_BASE_URL[env]}/${environmentId}/order/expire`;
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      if (!response.ok) {
        const { code, message } = (await response.json()) as SignApiError;
        throw new Error(code, { cause: message });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to expire transaction with ref: '${reference}'`, e);
    }
  }, [signResponse, env, environmentId]);

  const sign = useCallback(
    async (paymentType: PaymentTypes): Promise<SignResponse | undefined> => {
      try {
        await expirePrevSignedOrder();

        const data: SignApiRequest = {
          recipient_address: recipientAddress,
          payment_type: paymentType,
          currency_filter: SignCurrencyFilter.CONTRACT_ADDRESS,
          currency_value: fromContractAddress,
          products: items.map((item) => ({
            product_id: item.productId,
            quantity: item.qty,
          })),
        };

        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[env]}/${environmentId}/order/sign`;
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const { code, message } = (await response.json()) as SignApiError;
          throw new Error(code, { cause: message });
        }

        const responseData = toSignResponse(await response.json(), items);
        console.log('🚀 ~ responseData:', items);
        setSignResponse(responseData);

        return responseData;
      } catch (e) {
        setSignError({ type: SaleErrorTypes.DEFAULT, data: { error: e } });
      }
      return undefined;
    },
    [items, fromContractAddress, recipientAddress, environmentId, env, provider, expirePrevSignedOrder],
  );

  const execute = async (
    signData: SignResponse | undefined,
  ): Promise<ExecutedTransaction[]> => {
    if (!signData) {
      setSignError({
        type: SaleErrorTypes.DEFAULT,
        data: { reason: 'No sign data' },
      });
      return [];
    }
    let successful = true;
    const execTransactions: ExecutedTransaction[] = [];
    for (const transaction of signData.transactions) {
      const {
        contractAddress: to,
        rawData: data,
        methodCall: method,
        gasEstimate,
      } = transaction;
      // eslint-disable-next-line no-await-in-loop
      const hash = await sendTransaction(to, data, gasEstimate, method);

      if (!hash) {
        successful = false;
        break;
      }

      execTransactions.push({ method, hash });
    }

    if (successful) {
      setExecuteDone();
    }
    return execTransactions;
  };

  return {
    sign,
    signResponse,
    signError,
    execute,
    executeResponse,
  };
};

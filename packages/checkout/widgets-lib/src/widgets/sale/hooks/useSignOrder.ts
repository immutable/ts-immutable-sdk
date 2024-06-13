/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useState } from 'react';
import { SaleItem } from '@imtbl/checkout-sdk';

import {
  SignResponse,
  SignOrderInput,
  SignedOrderProduct,
  SignOrderError,
  ExecuteOrderResponse,
  ExecutedTransaction,
  SaleErrorTypes,
  SignPaymentTypes,
  SignedTransaction,
  ExecuteTransactionStep,
} from '../types';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';
import { hexToText } from '../functions/utils';
import { filterAllowedTransactions } from '../functions/signUtils';

type SignApiTransaction = {
  contract_address: string;
  gas_estimate: number;
  method_call: string;
  params: {
    amount?: number;
    spender?: string;
    data?: string[];
    deadline?: number;
    multicallSigner?: string;
    reference?: string;
    signature?: string;
    targets?: string[];
  };
  raw_data: string;
};

type SignApiProduct = {
  product_id: string;
  collection_address: string;
  contract_type: string;
  detail: {
    amount: number;
    token_id: string;
  }[];
};

type SignApiResponse = {
  order: {
    currency: {
      name: string;
      decimals: number;
      erc20_address: string;
    };
    currency_symbol: string;
    products: SignApiProduct[];
    total_amount: string;
  };
  transactions: SignApiTransaction[];
};

enum SignCurrencyFilter {
  CONTRACT_ADDRESS = 'contract_address',
  CURRENCY_SYMBOL = 'currency_symbol',
}

type SignApiRequest = {
  recipient_address: string;
  currency_filter: SignCurrencyFilter;
  currency_value: string;
  payment_type: string;
  products: {
    product_id: string;
    quantity: number;
  }[];
};

type SignApiError = {
  code: string;
  details: any;
  link: string;
  message: string;
  trace_id: string;
};

const toSignedProduct = (
  product: SignApiProduct,
  currency: string,
  item?: SaleItem,
): SignedOrderProduct => ({
  productId: product.product_id,
  image: item?.image || '',
  qty: item?.qty || 1,
  name: item?.name || '',
  description: item?.description || '',
  currency,
  contractType: product.contract_type,
  collectionAddress: product.collection_address,
  amount: product.detail.map(({ amount }) => amount),
  tokenId: product.detail.map(({ token_id: tokenId }) => tokenId),
});

const toSignResponse = (
  signApiResponse: SignApiResponse,
  items: SaleItem[],
): SignResponse => {
  const { order, transactions } = signApiResponse;

  return {
    order: {
      currency: {
        name: order.currency.name,
        erc20Address: order.currency.erc20_address,
      },
      products: order.products
        .map((product) => toSignedProduct(
          product,
          order.currency.name,
          items.find((item) => item.productId === product.product_id),
        ))
        .reduce((acc, product) => {
          const index = acc.findIndex((n) => n.name === product.name);

          if (index === -1) {
            acc.push({ ...product });
          }

          if (index > -1) {
            acc[index].amount = [...acc[index].amount, ...product.amount];
            acc[index].tokenId = [...acc[index].tokenId, ...product.tokenId];
          }

          return acc;
        }, [] as SignedOrderProduct[]),
      totalAmount: Number(order.total_amount),
    },
    transactions: transactions.map((transaction) => ({
      tokenAddress: transaction.contract_address,
      gasEstimate: transaction.gas_estimate,
      methodCall: transaction.method_call,
      params: {
        reference: transaction.params.reference || '',
        amount: transaction.params.amount || 0,
        spender: transaction.params.spender || '',
      },
      rawData: transaction.raw_data,
    })),
    transactionId: hexToText(
      transactions.find((txn) => txn.method_call.startsWith('execute'))?.params
        .reference || '',
    ),
  };
};

export const useSignOrder = (input: SignOrderInput) => {
  const {
    provider,
    items,
    environment,
    environmentId,
    waitFulfillmentSettlements,
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
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState<number>(0);

  const setExecuteTransactions = (transaction: ExecutedTransaction) => {
    setExecuteResponse((prev) => ({
      ...prev,
      transactions: [...prev.transactions, transaction],
    }));
  };

  const setExecuteDone = () => setExecuteResponse((prev) => ({ ...prev, done: true }));

  const setExecuteFailed = () => setExecuteResponse({
    done: false,
    transactions: [],
  });

  const sendTransaction = useCallback(
    async (
      to: string,
      data: string,
      gasLimit: number,
      method: string,
    ): Promise<[hash: string | undefined, error?: SignOrderError]> => {
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

        if (waitFulfillmentSettlements) {
          await txnResponse?.wait();
        }

        const transactionHash = txnResponse?.hash;
        if (!transactionHash) {
          throw new Error('Transaction hash is undefined');
        }
        return [transactionHash, undefined];
      } catch (err) {
        const reason = `${
          (err as any)?.reason || (err as any)?.message || ''
        }`.toLowerCase();

        let errorType = SaleErrorTypes.WALLET_FAILED;

        if (reason.includes('failed') && reason.includes('open confirmation')) {
          errorType = SaleErrorTypes.WALLET_POPUP_BLOCKED;
        }

        if (reason.includes('rejected') && reason.includes('user')) {
          errorType = SaleErrorTypes.WALLET_REJECTED;
        }

        if (
          reason.includes('failed to submit')
          && reason.includes('highest gas limit')
        ) {
          errorType = SaleErrorTypes.WALLET_REJECTED_NO_FUNDS;
        }

        if (
          reason.includes('status failed')
          || reason.includes('transaction failed')
        ) {
          errorType = SaleErrorTypes.TRANSACTION_FAILED;
        }
        const error: SignOrderError = {
          type: errorType,
          data: { error: err },
        };
        setSignError(error);
        return [undefined, error];
      }
    },
    [provider],
  );

  const sign = useCallback(
    async (
      paymentType: SignPaymentTypes,
      fromTokenAddress: string,
    ): Promise<SignResponse | undefined> => {
      try {
        const signer = provider?.getSigner();
        const address = (await signer?.getAddress()) || '';

        const data: SignApiRequest = {
          recipient_address: address,
          payment_type: paymentType,
          currency_filter: SignCurrencyFilter.CONTRACT_ADDRESS,
          currency_value: fromTokenAddress,
          products: items.map((item) => ({
            product_id: item.productId,
            quantity: item.qty,
          })),
        };

        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/sign`;
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const { ok, status } = response;
        if (!ok) {
          const { code } = (await response.json()) as SignApiError;
          let errorType: SaleErrorTypes;
          switch (status) {
            case 400:
              errorType = SaleErrorTypes.SERVICE_BREAKDOWN;
              break;
            case 404:
              if (code === 'insufficient_stock') {
                errorType = SaleErrorTypes.INSUFFICIENT_STOCK;
              } else {
                errorType = SaleErrorTypes.PRODUCT_NOT_FOUND;
              }
              break;
            case 429:
            case 500:
              errorType = SaleErrorTypes.DEFAULT;
              break;
            default:
              throw new Error('Unknown error');
          }

          setSignError({ type: errorType });
          return undefined;
        }

        const apiResponse: SignApiResponse = await response.json();
        const apiTokenIds = apiResponse.order.products
          .map((product) => product.detail.map(({ token_id }) => token_id))
          .flat();

        const responseData = toSignResponse(apiResponse, items);

        setTokenIds(apiTokenIds);
        setSignResponse(responseData);

        return responseData;
      } catch (e: any) {
        setSignError({ type: SaleErrorTypes.DEFAULT, data: { error: e } });
      }
      return undefined;
    },
    [items, environmentId, environment, provider],
  );

  const executeTransaction = async (
    transaction: SignedTransaction,
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: any, txns: ExecutedTransaction[]) => void,
  ) => {
    if (!transaction) {
      return false;
    }

    const {
      tokenAddress: to,
      rawData: data,
      methodCall: method,
      gasEstimate,
    } = transaction;

    const [hash, txnError] = await sendTransaction(
      to,
      data,
      gasEstimate,
      method,
    );

    if (txnError || !hash) {
      onTxnError(txnError, executeResponse.transactions);
      return false;
    }

    const execTransaction = { method, hash };
    onTxnSuccess(execTransaction);

    return true;
  };

  const executeAll = useCallback(
    async (
      signData: SignResponse | undefined,
      onTxnSuccess: (txn: ExecutedTransaction) => void,
      onTxnError: (error: any, txns: ExecutedTransaction[]) => void,
      onTxnStep?: (method: string, step: ExecuteTransactionStep) => void,
    ): Promise<ExecutedTransaction[]> => {
      if (!signData || !provider) {
        setSignError({
          type: SaleErrorTypes.DEFAULT,
          data: { reason: 'No sign data' },
        });

        return [];
      }

      console.log('@@@@@ Executing all ', signData);

      const transactions = await filterAllowedTransactions(
        signData.transactions,
        provider,
      );

      let successful = true;
      for (const transaction of transactions) {
        if (onTxnStep) {
          onTxnStep(transaction.methodCall, ExecuteTransactionStep.BEFORE);
        }

        // eslint-disable-next-line no-await-in-loop
        const success = await executeTransaction(
          transaction,
          onTxnSuccess,
          onTxnError,
        );

        if (!success) {
          successful = false;
          break;
        }

        if (onTxnStep) {
          onTxnStep(transaction.methodCall, ExecuteTransactionStep.AFTER);
        }
      }
      (successful ? setExecuteDone : setExecuteFailed)();

      return executeResponse.transactions;
    },
    [
      provider,
      executeTransaction,
      setExecuteDone,
      setExecuteFailed,
      filterAllowedTransactions,
      sendTransaction,
    ],
  );

  const executeNextTransaction = useCallback(
    async (
      onTxnSuccess: (txn: ExecutedTransaction) => void,
      onTxnError: (error: any, txns: ExecutedTransaction[]) => void,
    ): Promise<boolean> => {
      if (!signResponse || executeResponse.done || !provider) return false;

      const transactions = await filterAllowedTransactions(
        signResponse.transactions,
        provider,
      );

      const transaction = transactions[currentTransactionIndex];

      console.log('@@@@@ currentTransactionIndex', currentTransactionIndex);
      console.log('@@@@@ executeNextTransaction transaction', transaction);
      console.log('@@@@@ executeNextTransaction transactions', transactions);

      const success = await executeTransaction(
        transaction,
        onTxnSuccess,
        onTxnError,
      );

      if (success) {
        if (currentTransactionIndex === transactions.length - 1) {
          setExecuteDone();
        } else {
          setCurrentTransactionIndex((prev) => prev + 1);
        }
      }

      return success;
    },
    [
      currentTransactionIndex,
      signResponse,
      executeTransaction,
      provider,
      filterAllowedTransactions,
    ],
  );

  return {
    sign,
    signResponse,
    signError,
    executeAll,
    executeResponse,
    tokenIds,
    executeNextTransaction,
  };
};

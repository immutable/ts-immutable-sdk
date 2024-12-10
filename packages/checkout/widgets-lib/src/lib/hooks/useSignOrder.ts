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
  PRIMARY_SALES_API_BASE_URL,
  SignApiProduct,
  SignApiResponse,
  SignApiRequest,
  SignApiError,
  SignCurrencyFilter,
} from '../primary-sales';
import { filterAllowedTransactions, hexToText } from '../utils';

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
    customOrderData,
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
  const [filteredTransactions, setFilteredTransactions] = useState<
  SignedTransaction[]
  >([]);

  const setExecuteTransactions = (transaction: ExecutedTransaction) => {
    setExecuteResponse((prev) => ({
      ...prev,
      transactions: [...prev.transactions, transaction],
    }));
  };

  const setExecuteDone = () => setExecuteResponse((prev) => ({ ...prev, done: true }));

  const setTransactionIndex = () => setCurrentTransactionIndex((prev) => prev + 1);

  const setExecuteFailed = () => setExecuteResponse({
    done: false,
    transactions: [],
  });

  const sendTransaction = useCallback(
    async (
      to: string,
      data: string,
      gasLimit: number,
    ): Promise<[hash: string | undefined, error?: SignOrderError]> => {
      try {
        const signer = await provider?.getSigner();
        const gasPrice = (await provider?.getFeeData())?.gasPrice;
        const txnResponse = await signer?.sendTransaction({
          to,
          data,
          gasPrice,
          gasLimit,
        });

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
    [provider, waitFulfillmentSettlements],
  );

  const sign = useCallback(
    async (
      paymentType: SignPaymentTypes,
      fromTokenAddress: string,
    ): Promise<SignResponse | undefined> => {
      try {
        const signer = await provider?.getSigner();
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
          custom_data: customOrderData,
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

        if (provider) {
          const filterTransactions = await filterAllowedTransactions(
            responseData.transactions,
            provider,
          );
          setFilteredTransactions(filterTransactions);
        }

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

    const [hash, txnError] = await sendTransaction(to, data, gasEstimate);

    if (txnError || !hash) {
      onTxnError(txnError, executeResponse.transactions);
      return false;
    }

    const execTransaction = { method, hash };
    setExecuteTransactions(execTransaction);
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
      onTxnStep?: (method: string, step: ExecuteTransactionStep) => void,
    ): Promise<boolean> => {
      if (!filteredTransactions || executeResponse.done || !provider) return false;

      const transaction = filteredTransactions[currentTransactionIndex];

      if (onTxnStep) {
        onTxnStep(transaction.methodCall, ExecuteTransactionStep.BEFORE);
      }

      const success = await executeTransaction(
        transaction,
        onTxnSuccess,
        onTxnError,
      );

      if (success) {
        setTransactionIndex();

        if (currentTransactionIndex === filteredTransactions.length - 1) {
          setExecuteDone();
        }

        if (onTxnStep) {
          onTxnStep(transaction.methodCall, ExecuteTransactionStep.AFTER);
        }
      }

      return success;
    },
    [currentTransactionIndex, provider, filteredTransactions],
  );

  return {
    sign,
    signResponse,
    signError,
    filteredTransactions,
    currentTransactionIndex,
    executeAll,
    executeResponse,
    tokenIds,
    executeNextTransaction,
  };
};

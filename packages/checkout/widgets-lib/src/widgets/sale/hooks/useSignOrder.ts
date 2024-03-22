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
} from '../types';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';
import { hexToText } from '../functions/utils';

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
    provider, items, recipientAddress, environment, environmentId,
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
    ): Promise<[hash: string | undefined, error: any]> => {
      let transactionHash: string | undefined;
      let errorType = SaleErrorTypes.TRANSACTION_FAILED;

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

        // wait for the transaction to be mined
        const receipt = await txnResponse?.wait();
        if (receipt && receipt.status === 0) {
          throw new Error('Transaction failed after being mined');
        }

        transactionHash = txnResponse?.hash || '';
        return [transactionHash, undefined];
      } catch (err) {
        const reason = `${
          (err as any)?.reason || (err as any)?.message || ''
        }`.toLowerCase();
        transactionHash = (err as any)?.transactionHash;

        if (reason.includes('failed') && reason.includes('open confirmation')) {
          errorType = SaleErrorTypes.WALLET_POPUP_BLOCKED;
        } else if (reason.includes('rejected') && reason.includes('user')) {
          errorType = SaleErrorTypes.WALLET_REJECTED;
        } else if (
          reason.includes('failed to submit')
          && reason.includes('highest gas limit')
        ) {
          errorType = SaleErrorTypes.WALLET_REJECTED_NO_FUNDS;
        }

        setSignError({
          type: errorType,
          data: { error: err },
        });

        return [undefined, err];
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
        const data: SignApiRequest = {
          recipient_address: recipientAddress,
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
    [items, recipientAddress, environmentId, environment, provider],
  );

  const execute = async (
    signData: SignResponse | undefined,
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: any, txns: ExecutedTransaction[]) => void,
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
        tokenAddress: to,
        rawData: data,
        methodCall: method,
        gasEstimate,
      } = transaction;
      // eslint-disable-next-line no-await-in-loop
      const [hash, txnError] = await sendTransaction(
        to,
        data,
        gasEstimate,
        method,
      );
      if (txnError || !hash) {
        successful = false;
        onTxnError(txnError, execTransactions);
        break;
      }

      execTransactions.push({ method, hash });
      onTxnSuccess({ method, hash });
    }

    (successful ? setExecuteDone : setExecuteFailed)();

    return execTransactions;
  };

  return {
    sign,
    signResponse,
    signError,
    execute,
    executeResponse,
    tokenIds,
  };
};

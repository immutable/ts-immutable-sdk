/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { PrimaryRevenueSuccess } from '@imtbl/checkout-widgets';

import { Environment } from '@imtbl/config';
import {
  SignResponse,
  SignOrderInput,
  PaymentTypes,
  Item,
  SignedOrderProduct,
} from '../types';

const PRIMARY_SALES_API_BASE_URL = {
  [Environment.SANDBOX]:
    'https://game-primary-sales.sandbox.imtbl.com/v1/games/:gameId/order/sign',
  [Environment.PRODUCTION]:
    'https://game-primary-sales.imtbl.com/v1/games/:gameId/order/sign',
};

const X_IMMUTABLE_API_KEY = 'sk_imapik-Ekz6cLnnwREtqjGn$xo6_fb97b8';

type SignApiResponse = {
  order: {
    currency: string;
    products: {
      detail: {
        amount: number;
        collection_address: string;
        token_id: string;
      }[];
      product_id: string;
    }[];
    total_amount: string;
  };
  transactions: {
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
  }[];
};

const toSignedProduct = (
  product: SignApiResponse['order']['products'][0],
  currency: string,
  item?: Item,
): SignedOrderProduct => ({
  productId: product.product_id,
  image: item?.image || '',
  qty: `${item?.qty || 1}`,
  name: `${item?.name || ''}${item?.qty ? ` x${item.qty}` : ''}`,
  description: item?.description || '',
  currency,
  amount: product.detail.map(({ amount }) => amount),
  tokenId: product.detail.map(({ token_id: tokenId }) => Number(tokenId)),
});

const toSignResponse = (
  signApiResponse: SignApiResponse,
  items: Item[],
): SignResponse => {
  const { order, transactions } = signApiResponse;

  return {
    order: {
      currency: order.currency,
      products: order.products.map((product) => toSignedProduct(
        product,
        order.currency,
        items.find((item) => item.productId === product.product_id),
      )),
      totalAmount: Number(order.total_amount),
    },
    transactions: transactions.map((transaction) => ({
      contractAddress: transaction.contract_address,
      gasEstimate: transaction.gas_estimate,
      methodCall: transaction.method_call,
      params: {
        amount: transaction.params.amount as number,
        spender: transaction.params.spender as string,
      },
      rawData: transaction.raw_data,
    })),
  };
};

export const useSignOrder = (input: SignOrderInput) => {
  const {
    environment,
    gameId,
    items,
    fromCurrency,
    provider,
    recipientAddress,
  } = input;
  const [signResponse, setSignResponse] = useState<SignResponse | undefined>(undefined);

  const sendTx = useCallback(
    async (
      to: string,
      data: string,
      gasLimit: number,
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
        console.info('@@@ [PENDING] txn:', txnResponse?.hash);

        await txnResponse?.wait(1);

        transactionHash = txnResponse?.hash;
      } catch (error) {
        throw new Error('failed');
      }

      console.info('@@@ [SUBMITTED] txn:', transactionHash);
      return transactionHash;
    },
    [provider],
  );

  const sign = useCallback(
    async (paymentType: PaymentTypes): Promise<SignResponse | undefined> => {
      console.log('@@@ paymentType', paymentType);

      if (!provider || !recipientAddress || !fromCurrency || !items.length) {
        return undefined;
      }

      const data = {
        recipient_address: recipientAddress,
        currency: fromCurrency,
        payment_type: paymentType,
        products: items.map((item) => ({
          product_id: item.productId,
          quantity: item.qty,
        })),
      };

      try {
        const baseUrl = PRIMARY_SALES_API_BASE_URL[environment].replace(
          ':gameId',
          gameId,
        );
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-immutable-api-key': X_IMMUTABLE_API_KEY,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.statusText}`);
        }

        const responseData = toSignResponse(await response.json(), items);
        setSignResponse(responseData);

        return responseData;
      } catch (error) {
        console.error('Signing order failed:', error);
      }
      return undefined;
    },
    [items, fromCurrency, recipientAddress, environment, gameId],
  );

  const execute = useCallback(async (): Promise<PrimaryRevenueSuccess> => {
    if (!signResponse) {
      throw new Error('No sign data, retry /sign/order');
    }

    const transactionHashes = {};
    for (const transaction of signResponse.transactions) {
      const {
        contractAddress: to,
        rawData: data,
        methodCall: method,
        gasEstimate,
      } = transaction;
      // eslint-disable-next-line no-await-in-loop
      const transactionHash = await sendTx(to, data, gasEstimate);

      if (!transactionHash) {
        throw new Error('failed');
      }

      transactionHashes[method] = transactionHash;
    }

    return transactionHashes;
  }, [signResponse]);

  return {
    sign,
    execute,
    signResponse,
  };
};

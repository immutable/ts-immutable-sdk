/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useState } from 'react';
import { SaleSuccess } from '@imtbl/checkout-widgets';

import { Environment } from '@imtbl/config';
import {
  SignResponse,
  SignOrderInput,
  PaymentTypes,
  Item,
  SignedOrderProduct,
  SaleErrorTypes,
  SignOrderError,
} from '../types';

const PRIMARY_SALES_API_BASE_URL = {
  [Environment.SANDBOX]:
    'https://api.sandbox.immutable.com/v1/primary-sales/:environmentId/order/sign',
  [Environment.PRODUCTION]:
    'https://api.immutable.com/v1/primary-sales/:environmentId/order/sign',
};

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
  detail: {
    amount: number;
    collection_address: string;
    token_id: string;
  }[];
  product_id: string;
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
  item?: Item,
): SignedOrderProduct => ({
  productId: product.product_id,
  image: item?.image || '',
  qty: item?.qty || 1,
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
      contractAddress: transaction.contract_address,
      gasEstimate: transaction.gas_estimate,
      methodCall: transaction.method_call,
      params: {
        reference: transaction.params.reference || '',
        amount: transaction.params.amount || 0,
        spender: transaction.params.spender || '',
      },
      rawData: transaction.raw_data,
    })),
  };
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
  const [signError, setSignError] = useState<SignOrderError | undefined>(undefined);
  const [signResponse, setSignResponse] = useState<SignResponse | undefined>(
    undefined,
  );

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

        // TODO: call on processing handler to set new copy

        await txnResponse?.wait(1);

        transactionHash = txnResponse?.hash;
      } catch (e) {
        // TODO: check error type to send
        // SaleErrorTypes.WALLET_REJECTED or SaleErrorTypes.WALLET_REJECTED_NO_FUNDS

        const reason = typeof e === 'string' ? e : (e as any).reason || '';
        let errorType = SaleErrorTypes.TRANSACTION_FAILED;

        if (reason.includes('rejected') && reason.includes('user')) {
          errorType = SaleErrorTypes.WALLET_REJECTED;
        }

        if (reason.includes('failed to submit') && reason.includes('highest gas limit')) {
          errorType = SaleErrorTypes.WALLET_REJECTED_NO_FUNDS;
        }

        setSignError({
          type: errorType,
          data: { error: e },
        });
      }

      return transactionHash;
    },
    [provider],
  );

  const sign = useCallback(
    async (paymentType: PaymentTypes): Promise<SignResponse | undefined> => {
      if (!provider || !recipientAddress || !fromContractAddress || !items.length) {
        return undefined;
      }

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

      try {
        const baseUrl = PRIMARY_SALES_API_BASE_URL[env].replace(
          ':environmentId',
          environmentId,
        );
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
        setSignResponse(responseData);

        return responseData;
      } catch (e) {
        setSignError({ type: SaleErrorTypes.DEFAULT, data: { error: e } });
      }
      return undefined;
    },
    [items, fromContractAddress, recipientAddress, environmentId, env],
  );

  const execute = useCallback(async (): Promise<SaleSuccess> => {
    if (!signResponse) {
      setSignError({
        type: SaleErrorTypes.DEFAULT,
        data: { reason: 'No signed response, try again' },
      });
      return {};
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
        break;
      }

      transactionHashes[method] = transactionHash;
    }

    return transactionHashes;
  }, [signResponse]);

  return {
    sign,
    execute,
    signResponse,
    signError,
  };
};

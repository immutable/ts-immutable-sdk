/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { PrimaryRevenueSuccess } from '@imtbl/checkout-widgets';

export enum PaymentType {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
}

export type SignProductResponse = {
  product_id: string;
  detail: {
    amount: number;
    collector_address: string;
    token_id: string;
  }[];
};

export type SignOrderResponse = {
  currency: string;
  total_amount: number;
  products: SignProductResponse[];
};

export type SignResponse = {
  order: SignOrderResponse;
  transactions: {
    contract_address: string;
    gas_estimate: number;
    method_call: string;
    params: {
      amount: number;
      spender: string;
    };
    raw_data: string;
  }[];
};

type SignOrderInput = {
  items: {
    productId: string;
    qty: number;
  }[];
  fromCurrency?: string;
  provider: Web3Provider | undefined;
};

export const useSignOrder = ({
  items,
  fromCurrency,
  provider,
}: SignOrderInput) => {
  const [signData, setSignData] = useState<SignResponse | undefined>();
  const [recipientAddress, setRecipientAddress] = useState<string | undefined>(
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
        console.log('🚀 ~ [PENDING] txn:', txnResponse?.hash);

        await txnResponse?.wait(1);

        transactionHash = txnResponse?.hash;
      } catch (error) {
        throw new Error('failed');
      }

      console.log('🚀 [SUBMITTED] txn:', transactionHash);
      return transactionHash;
    },
    [provider],
  );

  const sign = useCallback(
    async (paymentType: PaymentType): Promise<SignResponse | undefined> => {
      console.log('@@@ paymentType', paymentType);
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
        const response = await fetch(
          'https://game-primary-sales.sandbox.imtbl.com/v1/games/pokemon/order/sign',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-immutable-api-key': 'sk_imapik-Ekz6cLnnwREtqjGn$xo6_fb97b8', // FIXME: store in api key in env
            },
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          // Handle HTTP errors
          throw new Error(`HTTP Error: ${response.statusText}`);
        }

        const json = await response.json();
        setSignData(json);

        return json;
      } catch (error) {
        console.error('Signing order failed:', error);
        // TODO: Consider setting an error state here
      }
      return undefined;
    },
    [items, fromCurrency, recipientAddress],
  );

  const execute = useCallback(async (): Promise<PrimaryRevenueSuccess> => {
    if (!signData) {
      // FIXME: ensure is not empty
      throw new Error('No sign data, retry /sign/order');
    }

    const transactionHashes = {};
    for (const transaction of signData.transactions) {
      const {
        contract_address: to,
        raw_data: data,
        method_call: method,
      } = transaction;
      // sending transactions one-at-a-time
      // eslint-disable-next-line no-await-in-loop
      const transactionHash = await sendTx(to, data, 5000000);

      if (!transactionHash) {
        throw new Error('failed');
      }

      transactionHashes[method] = transactionHash;
    }

    return transactionHashes;
  }, [signData]);

  useEffect(() => {
    const getRecipientAddress = async () => {
      const signer = provider?.getSigner();
      const address = await signer?.getAddress();
      setRecipientAddress(address);
    };

    getRecipientAddress();
  }, [provider]);

  return { sign, execute, sendTx };
};

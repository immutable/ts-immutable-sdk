/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { PrimaryRevenueSuccess } from '@imtbl/checkout-widgets';

type SignDataType = {
  transactions: {
    contract_address: string;
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

type Input = {
  amount: string;
  fromContractAddress: string;
  fromCollectionAddress: string;
  items: {
    id: string;
    name: string;
    price: string;
    qty: number;
    image: string;
  }[];
  fromCurrency?: string;
  paymentMethod?: string;
  envId?: string;
  provider: Web3Provider | undefined;
};

export const useSignOrder = ({
  items,
  amount,
  fromContractAddress,
  fromCollectionAddress,
  provider,
}: Input) => {
  const [signData, setSignData] = useState<SignDataType | undefined>();
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

  const sign = useCallback(async (): Promise<void> => {
    const data = {
      amount: Number(amount),
      recipient_address: recipientAddress,
      erc20_contract_address: fromContractAddress,
      items: items.map((item) => ({
        collection_address: fromCollectionAddress,
        token_id: item.id,
      })),
    };

    try {
      const response = await fetch(
        'https://game-primary-sales.sandbox.imtbl.com/v1/games/pokemon/order/sign',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-immutable-api-key': 'sk_imapik-Ekz6cLnnwREtqjGn$xo6_fb97b8',
          },
          body: JSON.stringify(data),
        },
      );

      const json = await response.json();

      setSignData(json);
    } catch (error) {
      //
    }
  }, [
    items,
    amount,
    fromCollectionAddress,
    fromContractAddress,
    recipientAddress,
  ]);

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

/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useState } from 'react';

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
  recipientAddress: string;
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
};

export const useSignOrder = ({
  items,
  amount,
  fromContractAddress,
  recipientAddress,
  fromCollectionAddress,
}: Input) => {
  const [signData, setSignData] = useState<SignDataType | undefined>();

  const sign = useCallback(async () => {
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
    amount,
    fromCollectionAddress,
    fromContractAddress,
    items,
    recipientAddress,
  ]);

  const execute = useCallback(async () => {
    console.log('signData', signData);

    try {
      // for each transaction call a fn
      signData?.transactions.forEach(async (transaction) => {
        console.log('transaction', transaction);
      });
    } catch (error) {
      //
    }
  }, []);

  return {
    sign,
    execute,
  };
};

import { useCallback, useEffect, useState } from 'react';
import { SignResponse } from './useSignOrder';

export type Item = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};

export type MergedItemsDetails = {
  productId: string;
  qty: string;
  image: string;
  name: string;
  description: string;
  amount: number[];
  tokenId: number[];
  currency: string;
};

export const useMergeItemsInfo = (
  clientItems: Item[],
  signResponse: SignResponse,
) => {
  const [mergedItems, setMergedItems] = useState<MergedItemsDetails[]>([]);

  const getMergedItems = useCallback((): MergedItemsDetails[] => {
    const mapClientItems: Record<number, Item> = {};
    clientItems.forEach((item) => {
      mapClientItems[item.productId] = item;
    });

    const mergedArray = signResponse.order.products.map((item) => {
      const matchedClientItem = mapClientItems[item.product_id];
      return {
        productId: item.product_id,
        image: matchedClientItem?.image || null,
        qty: matchedClientItem?.qty || null,
        name: matchedClientItem?.name || null,
        description: matchedClientItem?.description || null,
        currency: signResponse.order.currency,
        amount: item.detail.map(({ amount }) => amount),
        tokenId: item.detail.map(({ token_id: tokenId }) => Number(tokenId)),
      };
    });

    return mergedArray;
  }, [clientItems, signResponse]);

  useEffect(() => {
    if (signResponse) {
      setMergedItems(getMergedItems);
    }
  }, [clientItems, signResponse]);

  return mergedItems;
};

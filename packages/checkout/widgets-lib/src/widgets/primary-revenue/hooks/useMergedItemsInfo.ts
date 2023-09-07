import { useCallback } from 'react';
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
  qty: number;
  amount: number;
  image: string;
  name: string;
  description: string;
  tokenId: string;
  currency: string;
};

export const useMergedItemsInfo = (
  clientItems: Item[],
  backendItems: SignResponse,
) => {
  const getMergedItemsList = useCallback(() => {
    // Create a hashmap from clientItems for quick lookup
    const mapClientItems: Record<number, Item> = {};
    clientItems.forEach((item) => {
      mapClientItems[item.productId] = item;
    });

    // Merge backedItems and hashmap into a new array
    const mergedArray = backendItems.order.products.map((item) => {
      const matchedClientItem = mapClientItems[item.product_id];
      return {
        productId: item.product_id,
        image: matchedClientItem ? matchedClientItem.image : null,
        tokenId: item.detail[0].token_id,
        qty: matchedClientItem ? matchedClientItem.qty : null,
        name: matchedClientItem ? matchedClientItem.name : null,
        description: matchedClientItem ? matchedClientItem.description : null,
        amount: item.detail[0].amount,
        currency: backendItems.order.currency,
      };
    });

    return mergedArray;
  }, [clientItems, backendItems]);

  return { getMergedItemsList };
};

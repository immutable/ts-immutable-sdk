import { SaleItem } from '@imtbl/checkout-sdk';

export function deduplicateSaleItemsArray(items: SaleItem[] | undefined): SaleItem[] {
  if (!items || !Array.isArray(items)) return [];

  const uniqueItems = items.reduce((acc, item) => {
    const itemIndex = acc.findIndex(
      ({ productId }) => productId === item.productId,
    );

    if (itemIndex !== -1) {
      acc[itemIndex] = { ...item, qty: acc[itemIndex].qty + item.qty };
      return acc;
    }

    return [...acc, { ...item }];
  }, [] as SaleItem[]);

  return uniqueItems;
}

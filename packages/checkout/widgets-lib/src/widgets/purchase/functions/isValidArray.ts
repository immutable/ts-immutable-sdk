import { PurchaseItem } from '@imtbl/checkout-sdk';

export function isValidArray(items: PurchaseItem[] | undefined): boolean {
  try {
    return Array.isArray(items);
  } catch {
    return false;
  }
}

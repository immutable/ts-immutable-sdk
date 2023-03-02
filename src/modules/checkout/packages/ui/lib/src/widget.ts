export const IMTBL_CHECKOUT_NAMESPACE = 'imtbl-checkout';

export function addToLocalStorage(key: string, value: any) {
  return localStorage.setItem(`${IMTBL_CHECKOUT_NAMESPACE}.${key}`, value);
}

export function removeFromLocalStorage(key: string) {
  return localStorage.removeItem(`${IMTBL_CHECKOUT_NAMESPACE}.${key}`);
}

export function getFromLocalStorage(key: string) {
  return localStorage.getItem(`${IMTBL_CHECKOUT_NAMESPACE}.${key}`);
}

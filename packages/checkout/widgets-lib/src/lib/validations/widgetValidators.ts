import { WalletProviderName } from '@imtbl/checkout-sdk';
import { isAddress } from 'ethers/lib/utils';
import { amountInputValidation } from './amountInputValidations';
import { NATIVE } from '../constants';

export function isValidWalletProvider(walletProvider:string) {
  if (walletProvider.length === 0) return false;
  return Object.values(WalletProviderName).includes(walletProvider as WalletProviderName);
}

export function isValidAmount(amount: string) {
  if (amount.length === 0) return true; // let empty string pass through
  if (!parseFloat(amount)) return false;
  if (Number.isNaN(parseFloat(amount))) return false;

  return amountInputValidation(amount);
}

export function isValidAddress(address:string) {
  if (address === NATIVE) return true;
  return isAddress(address);
}

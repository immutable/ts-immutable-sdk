import { WalletProviderName } from '@imtbl/checkout-sdk';
import { isAddress } from 'ethers/lib/utils';
import { amountInputValidation } from './amountInputValidations';
import { NATIVE } from '../constants';

export function isValidWalletProvider(walletProvider: string | undefined) {
  if (walletProvider === undefined) return false;
  if (walletProvider === '') return false;
  return Object.values(WalletProviderName).includes(walletProvider as WalletProviderName);
}

export function isValidAmount(amount: string | undefined) {
  if (amount === undefined) return false;
  if (amount === '') return true; // let empty string pass through
  if (!parseFloat(amount)) return false;
  if (Number.isNaN(parseFloat(amount))) return false;

  return amountInputValidation(amount);
}

export function isValidAddress(address: string | undefined) {
  if (address === undefined) return false;
  if (address === '') return true;
  if (address === NATIVE) return true;
  return isAddress(address);
}

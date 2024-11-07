import { WalletProviderName } from '@imtbl/checkout-sdk';
import { isAddress } from 'ethers';
import { amountInputValidation } from './amountInputValidations';
import { isNativeToken } from '../utils';

export function isValidWalletProvider(walletProviderName: string | undefined) {
  if (walletProviderName === undefined) return true; // allow undefined as it may not be defined
  if (walletProviderName === '') return false;
  return Object.values(WalletProviderName).includes(walletProviderName as WalletProviderName);
}

export function isValidAmount(amount: string | undefined) {
  if (amount === undefined) return false;
  if (amount === '') return true; // let empty string pass through
  if (!parseFloat(amount)) return false;
  if (Number.isNaN(parseFloat(amount))) return false;

  return amountInputValidation(amount);
}

export function isValidAddress(address: string | undefined) {
  if (isNativeToken(address)) return true;
  return isAddress(address!);
}

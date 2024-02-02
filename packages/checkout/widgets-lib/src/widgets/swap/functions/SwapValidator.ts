import { TokenInfo } from '@imtbl/checkout-sdk';

export function validateFromToken(fromToken?: TokenInfo): string {
  if (!fromToken) return 'views.SWAP.validation.noFromTokenSelected';
  return '';
}

export function validateFromAmount(amount: string, balance?: string): string {
  if (!amount || parseFloat(amount) === 0) return 'views.SWAP.validation.noAmountInputted';
  if (balance && Number(amount) > Number(balance)) return 'views.SWAP.validation.insufficientBalance';
  return '';
}

export function validateToToken(toToken?: TokenInfo): string {
  if (!toToken) return 'views.SWAP.validation.noToTokenSelected';
  return '';
}

export function validateToAmount(amount: string): string {
  if (!amount || parseFloat(amount) === 0) return 'views.SWAP.validation.noAmountInputted';
  return '';
}

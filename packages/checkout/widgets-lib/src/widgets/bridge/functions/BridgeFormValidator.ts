import { GetBalanceResult } from '@imtbl/checkout-sdk';

export function validateToken(fromToken: GetBalanceResult | undefined): string {
  if (!fromToken) return 'views.BRIDGE_FORM.validation.noTokenSelected';
  return '';
}

export function validateAmount(amount: string, balance?: string): string {
  if (!amount || parseFloat(amount) === 0) return 'views.BRIDGE_FORM.validation.noAmountInputted';
  if (balance && Number(amount) > Number(balance)) return 'views.BRIDGE_FORM.validation.insufficientBalance';
  return '';
}

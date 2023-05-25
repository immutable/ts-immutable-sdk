import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { text } from '../../../resources/text/textConfig';

export function validateToken(fromToken: GetBalanceResult | null): string {
  const { validation } = text.views[BridgeWidgetViews.BRIDGE];
  if (!fromToken) return validation.noTokenSelected;
  return '';
}

export function validateAmountWithBalance(amount, balance?:string) {
  const { validation } = text.views[BridgeWidgetViews.BRIDGE];
  if (balance && Number(amount) > Number(balance)) return validation.insufficientBalance;
  return null;
}

export function validateAmount(amount: string, balance?: string): string {
  const { validation } = text.views[BridgeWidgetViews.BRIDGE];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  const balanceError = validateAmountWithBalance(amount, balance);
  if (balanceError) return balanceError;
  return '';
}

import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { text } from '../../../resources/text/textConfig';

export function validateToken(fromToken: GetBalanceResult | undefined): string {
  const { validation } = text.views[BridgeWidgetViews.BRIDGE];
  if (!fromToken) return validation.noTokenSelected;
  return '';
}

export function validateAmount(amount: string, balance?: string): string {
  const { validation } = text.views[BridgeWidgetViews.BRIDGE];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  if (balance && Number(amount) > Number(balance)) return validation.insufficientBalance;
  return '';
}

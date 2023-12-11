import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from '../../../resources/text/textConfig';

export function validateToken(fromToken: GetBalanceResult | undefined): string {
  const { validation } = text.views[XBridgeWidgetViews.BRIDGE_FORM];
  if (!fromToken) return validation.noTokenSelected;
  return '';
}

export function validateAmount(amount: string, balance?: string): string {
  const { validation } = text.views[XBridgeWidgetViews.BRIDGE_FORM];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  if (balance && Number(amount) > Number(balance)) return validation.insufficientBalance;
  return '';
}

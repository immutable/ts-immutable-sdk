import { TokenInfo } from '@imtbl/checkout-sdk';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../resources/text/textConfig';

export function validateFromToken(fromToken?: TokenInfo): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!fromToken) return validation.noFromTokenSelected;
  return '';
}

export function validateFromAmount(amount: string, balance?: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  if (balance && Number(amount) > Number(balance)) return validation.insufficientBalance;
  return '';
}

export function validateToToken(toToken?: TokenInfo): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!toToken) return validation.noToTokenSelected;
  return '';
}

export function validateToAmount(amount: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  return '';
}

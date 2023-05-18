import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../resources/text/textConfig';

export function ValidateFromToken(swapFromToken: GetBalanceResult | null): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!swapFromToken) return validation.noToTokenSelected;
  return '';
}

export function ValidateFromAmount(amount: string, balance?: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount) return validation.noAmountInputted;
  if (balance && Number(amount) > Number(balance)) return validation.insufficientBalance;
  return '';
}

export function ValidateToToken(swapToToken: TokenInfo | null): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!swapToToken) return validation.noToTokenSelected;
  return '';
}

export function ValidateToAmount(amount: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount) return validation.noAmountInputted;
  return '';
}

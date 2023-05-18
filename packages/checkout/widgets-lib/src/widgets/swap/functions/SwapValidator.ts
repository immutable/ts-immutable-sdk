import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../resources/text/textConfig';

// todo: implement all validation scenarios & write tests

export function ValidateToken(swapFromToken: GetBalanceResult | TokenInfo | null): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!swapFromToken) return validation.noToTokenSelected;
  return '';
}

export function ValidateAmount(amount: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount) return validation.noAmountInputted;
  return '';
}

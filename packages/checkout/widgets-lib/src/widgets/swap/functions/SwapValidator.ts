import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../resources/text/textConfig';

export function ValidateFromToken(fromToken: GetBalanceResult | null): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!fromToken) return validation.noFromTokenSelected;
  return '';
}

export function ValidateFromAmount(amount: string, balance?: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  if (balance && Number(amount) > Number(balance)) return validation.insufficientBalance;
  return '';
}

export function ValidateToToken(toToken: TokenInfo | null): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!toToken) return validation.noToTokenSelected;
  return '';
}

export function ValidateToAmount(amount: string): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (!amount || parseFloat(amount) === 0) return validation.noAmountInputted;
  return '';
}

export function ValidateTokens(
  fromToken: GetBalanceResult | null,
  toToken: TokenInfo | null,
): string {
  const { validation } = text.views[SwapWidgetViews.SWAP];
  if (fromToken?.token.symbol === toToken?.symbol) return validation.sameTokenSelected;
  return '';
}

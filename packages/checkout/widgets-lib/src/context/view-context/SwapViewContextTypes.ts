export enum SwapWidgetViews {
  SWAP = 'SWAP',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  PRICE_SURGE = 'PRICE_SURGE',
}

export type SwapWidgetView =
  | SwapView
  | { type: SwapWidgetViews.SUCCESS }
  | PriceSurgeView
  | SwapFailView;

interface SwapFailView {
  type: SwapWidgetViews.FAIL;
  data: PrefilledSwapForm;
  reason?: string;
}

interface PriceSurgeView {
  type: SwapWidgetViews.PRICE_SURGE;
  data: PrefilledSwapForm;
}

interface SwapView {
  type: SwapWidgetViews.SWAP;
  data?: PrefilledSwapForm;
}

export interface PrefilledSwapForm {
  fromAmount: string;
  fromContractAddress: string;
  toContractAddress: string;
}

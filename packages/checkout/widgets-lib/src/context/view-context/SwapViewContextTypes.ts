export enum SwapWidgetViews {
  SWAP = 'SWAP',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  PRICE_SURGE = 'PRICE_SURGE',
}

export type SwapWidgetView =
  | { type: SwapWidgetViews.SWAP }
  | { type: SwapWidgetViews.SUCCESS }
  | { type: SwapWidgetViews.PRICE_SURGE }
  | SwapFailView;

interface SwapFailView {
  type: SwapWidgetViews.FAIL;
  reason: string;
}

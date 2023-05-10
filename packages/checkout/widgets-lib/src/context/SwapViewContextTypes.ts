export enum SwapWidgetViews {
  SWAP = 'SWAP',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}
export type SwapWidgetView =
  | { type: SwapWidgetViews.SWAP }
  | { type: SwapWidgetViews.SUCCESS }
  | SwapFailView;

interface SwapFailView {
  type: SwapWidgetViews.FAIL;
  reason: string;
}

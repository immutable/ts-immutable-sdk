export enum TransitionExampleWidgetViews {
  PAGE_ONE = "PAGE_ONE",
  PAGE_TWO = "PAGE_TWO",
  PAGE_THREE = "PAGE_THREE"
}

export type  TransitionExampleWidgetView = { type: TransitionExampleWidgetViews.PAGE_ONE; } | { type: TransitionExampleWidgetViews.PAGE_TWO; } | { type: TransitionExampleWidgetViews.PAGE_THREE; }
export enum TransitionExampleWidgetViews {
  VIEW_ONE = 'VIEW_ONE',
  VIEW_TWO = 'VIEW_TWO',
  VIEW_THREE = 'VIEW_THREE',
}

export type TransitionExampleWidgetView =
  | { type: TransitionExampleWidgetViews.VIEW_ONE }
  | { type: TransitionExampleWidgetViews.VIEW_TWO }
  | { type: TransitionExampleWidgetViews.VIEW_THREE };

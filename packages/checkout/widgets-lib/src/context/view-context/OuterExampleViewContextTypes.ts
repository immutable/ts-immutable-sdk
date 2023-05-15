export enum OuterExampleWidgetViews {
  VIEW_ONE = 'VIEW_ONE',
  VIEW_TWO = 'VIEW_TWO',
  VIEW_THREE = 'VIEW_THREE',
}

export type OuterExampleWidgetView =
  | { type: OuterExampleWidgetViews.VIEW_ONE }
  | { type: OuterExampleWidgetViews.VIEW_TWO }
  | { type: OuterExampleWidgetViews.VIEW_THREE };

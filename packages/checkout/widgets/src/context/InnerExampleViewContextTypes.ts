export enum InnerExampleWidgetViews {
  VIEW_ONE = 'VIEW_ONE',
  VIEW_TWO = 'VIEW_TWO',
  VIEW_THREE = 'VIEW_THREE',
}

export type InnerExampleWidgetView =
  | { type: InnerExampleWidgetViews.VIEW_ONE }
  | { type: InnerExampleWidgetViews.VIEW_TWO }
  | { type: InnerExampleWidgetViews.VIEW_THREE };

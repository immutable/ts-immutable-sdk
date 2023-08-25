import { ViewType } from './ViewType';

export enum OnRampWidgetViews {
  ONRAMP = 'ONRAMP',
}

export type OnRampWidgetView =
  | OnRampView;

interface OnRampView extends ViewType {
  type: OnRampWidgetViews.ONRAMP;
  data?: any;
}

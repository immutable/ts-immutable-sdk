import { ViewType } from './ViewType';

export enum OnRampWidgetViews {
  ONRAMP = 'ONRAMP',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type OnRampWidgetView =
  | OnRampView
  | OnRampInProgressView
  | OnRampSuccessView
  | OnRampFailView;

interface OnRampView extends ViewType {
  type: OnRampWidgetViews.ONRAMP;
  data?: any;
}

interface OnRampInProgressView extends ViewType {
  type: OnRampWidgetViews.IN_PROGRESS;
  data?: any;
}

export interface OnRampSuccessView extends ViewType {
  type: OnRampWidgetViews.SUCCESS;
  data?: {
    transactionHash: string;
  }
}
interface OnRampFailView extends ViewType {
  type: OnRampWidgetViews.FAIL;
  reason?: string;
}

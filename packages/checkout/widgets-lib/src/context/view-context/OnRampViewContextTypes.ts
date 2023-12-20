import { ViewType } from './ViewType';

export enum OnRampWidgetViews {
  ONRAMP = 'ONRAMP',
  IN_PROGRESS_LOADING = 'IN_PROGRESS_LOADING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type OnRampWidgetView =
  | OnRampView
  | OnRampInProgressLoadingView
  | OnRampInProgressView
  | OnRampSuccessView
  | OnRampFailView;

interface OnRampView extends ViewType {
  type: OnRampWidgetViews.ONRAMP;
  data?: PrefilledOnRampData;
}
interface OnRampInProgressLoadingView extends ViewType {
  type: OnRampWidgetViews.IN_PROGRESS_LOADING;
}
interface OnRampInProgressView extends ViewType {
  type: OnRampWidgetViews.IN_PROGRESS;
}
export interface OnRampSuccessView extends ViewType {
  type: OnRampWidgetViews.SUCCESS;
  data: {
    transactionHash: string;
  }
}
export interface OnRampFailView extends ViewType {
  type: OnRampWidgetViews.FAIL;
  reason?: string;
  data?: PrefilledOnRampData;
}
interface PrefilledOnRampData {
  amount?: string;
  tokenAddress?: string;
}

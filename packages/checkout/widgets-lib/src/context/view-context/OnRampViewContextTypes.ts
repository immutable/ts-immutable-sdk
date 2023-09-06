import { ViewType } from './ViewType';

export enum OnRampWidgetViews {
  ONRAMP = 'ONRAMP',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type OnRampWidgetView =
  | OnRampView
  | OnRampLoadingView
  | OnRampSuccessView
  | OnRampFailView;

interface OnRampView extends ViewType {
  type: OnRampWidgetViews.ONRAMP;
  data?: PrefilledOnRampData;
}
interface OnRampLoadingView extends ViewType {
  type: OnRampWidgetViews.LOADING;
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
  contractAddress?: string;
}

import { ViewType } from './ViewType';

export enum TransferWidgetViews {
  TRANSFER = 'TRANSFER',
}

export type TransferWidgetView = TransferView;

interface TransferView extends ViewType {
  type: TransferWidgetViews.TRANSFER;
}

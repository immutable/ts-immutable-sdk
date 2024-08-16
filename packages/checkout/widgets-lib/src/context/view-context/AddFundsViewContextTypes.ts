import { ViewType } from './ViewType';

export enum AddFundsWidgetViews {
  ADD_FUNDS = 'ADD_FUNDS',
}

export type AddFundsWidgetView = AddFundsView;

interface AddFundsView extends ViewType {
  type: AddFundsWidgetViews.ADD_FUNDS;
}

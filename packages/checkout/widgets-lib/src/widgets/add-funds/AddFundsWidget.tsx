import { AddFundsWidgetParams } from '@imtbl/checkout-sdk/dist/widgets/definitions/parameters/addFunds';
import { Checkout, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useContext, useMemo, useReducer } from 'react';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { TopUpView } from '../../views/top-up/TopUpView';
import {
  sendAddFundsCloseEvent,
  sendAddFundsGoBackEvent,
} from './AddFundsWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
  checkout: Checkout;
  web3Provider?: Web3Provider;
};
const isOnRampEnabled = true;
const isSwapEnabled = true;
const isBridgeEnabled = true;

export default function AddFundsWidget({
  config,
  checkout,
  web3Provider,
}: AddFundsWidgetInputs) {
  // eslint-disable-next-line no-console
  console.log(config, checkout, web3Provider);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewReducer],
  );

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <TopUpView
        analytics={{ userJourney: UserJourney.ADD_FUNDS }}
        widgetEvent={IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT}
        checkout={checkout}
        provider={web3Provider}
        showOnrampOption={isOnRampEnabled}
        showSwapOption={isSwapEnabled}
        showBridgeOption={isBridgeEnabled}
        onCloseButtonClick={() => sendAddFundsCloseEvent(eventTarget)}
        onBackButtonClick={() => sendAddFundsGoBackEvent(eventTarget)}
      />
    </ViewContext.Provider>
  );
}

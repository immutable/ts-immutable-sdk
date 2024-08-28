import { AddFundsWidgetParams, Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useContext, useMemo, useReducer } from 'react';
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
import { AddFunds } from './views/AddFunds';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export default function AddFundsWidget({
  checkout,
  web3Provider,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  tokenAddress,
  amount,
}: AddFundsWidgetInputs) {
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
      <AddFunds
        checkout={checkout}
        provider={web3Provider}
        tokenAddress={tokenAddress}
        amount={amount}
        showOnrampOption={showOnrampOption}
        showSwapOption={showSwapOption}
        showBridgeOption={showBridgeOption}
        onCloseButtonClick={() => sendAddFundsCloseEvent(eventTarget)}
        onBackButtonClick={() => sendAddFundsGoBackEvent(eventTarget)}
      />
    </ViewContext.Provider>
  );
}

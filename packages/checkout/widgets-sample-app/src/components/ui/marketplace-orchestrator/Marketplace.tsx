import { useReducer } from 'react';
import { useConnectWidget } from './useConnectWidget.hook';
import { useWalletWidget } from './useWalletWidget.hook';
import { useSwapWidget } from './useSwapWidget.hook';
import { useBridgeWidget } from './useBridgeWidget.hook';
import {
  WidgetActions,
  WidgetContext,
  initialWidgetState,
  widgetReducer,
} from './WidgetContext';

export const Marketplace = () => {
  const [widgetState, widgetDispatch] = useReducer(
    widgetReducer,
    initialWidgetState
  );
  const {
    showConnectWidget,
    showWalletWidget,
    showSwapWidget,
    showBridgeWidget,
  } = widgetState;

  const { providerPreference, setProviderPreference } = useConnectWidget(
    showConnectWidget,
    widgetDispatch
  );

  useWalletWidget(showWalletWidget, widgetDispatch);
  useSwapWidget(showSwapWidget, widgetDispatch);
  useBridgeWidget(showBridgeWidget, widgetDispatch);

  function openConnectWidget() {
    widgetDispatch({
      payload: {
        type: WidgetActions.SHOW_CONNECT_WIDGET,
        connectWidgetInputs: {},
      },
    });
  }

  function openWalletWidget() {
    widgetDispatch({
      payload: {
        type: WidgetActions.SHOW_WALLET_WIDGET,
        walletWidgetInputs: {},
      },
    });
  }

  function openSwapWidget() {
    widgetDispatch({
      payload: {
        type: WidgetActions.SHOW_SWAP_WIDGET,
        swapWidgetInputs: {},
      },
    });
  }

  function openBridgeWidget() {
    widgetDispatch({
      payload: {
        type: WidgetActions.SHOW_BRIDGE_WIDGET,
        bridgeWidgetInputs: {},
      },
    });
  }

  return (
    <WidgetContext.Provider value={{ widgetState, widgetDispatch }}>
      <div>
        <h1>Sample Marketplace Orchestrator</h1>
        {!providerPreference && (
          <button onClick={openConnectWidget}>Connect Wallet</button>
        )}
        {showConnectWidget && (
          <imtbl-connect providerPreference="" theme="dark"></imtbl-connect>
        )}
        {providerPreference && !showWalletWidget && (
          <button onClick={openWalletWidget}>My Wallet</button>
        )}
        {showWalletWidget && (
          <imtbl-wallet
            providerPreference={providerPreference}
            theme="dark"
          ></imtbl-wallet>
        )}
        {showSwapWidget && (
          <imtbl-swap
            providerPreference={providerPreference}
            theme="dark"
            fromContractAddress=""
            toContractAddress=""
            amount="0"
          ></imtbl-swap>
        )}
        {showBridgeWidget && (
          <imtbl-bridge
            providerPreference={providerPreference}
            theme="dark"
            fromContractAddress=""
            amount="0"
            fromNetwork=""
          ></imtbl-bridge>
        )}
      </div>
    </WidgetContext.Provider>
  );
};

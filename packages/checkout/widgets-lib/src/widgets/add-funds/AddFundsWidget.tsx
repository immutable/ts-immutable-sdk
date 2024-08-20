import { AddFundsWidgetParams } from '@imtbl/checkout-sdk/dist/widgets/definitions/parameters/addFunds';
import { Checkout, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import {
  createConfig, EVM, getToken, getTokenBalance,
} from '@lifi/sdk';
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
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  useEffect(() => {
    (async () => {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom({
          async request({
            method,
            params,
          }) {
            const response = await web3Provider?.jsonRpcFetchFunc(method, params);
            return response;
          },
        }),
      });

      const evmProvider = EVM({
        getWalletClient: async () => client,
      });

      createConfig({
        integrator: 'immutable',
        providers: [evmProvider],
      });

      const chainId = 1;
      const tokenContractAddress = '0x0000000000000000000000000000000000000000';
      const walletAddress = await web3Provider?.getSigner().getAddress();

      try {
        const token = await getToken(chainId, tokenContractAddress);
        const tokenBalance = await getTokenBalance(walletAddress!, token);
        console.log(tokenBalance);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [web3Provider]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <TopUpView
        analytics={{ userJourney: UserJourney.ADD_FUNDS }}
        widgetEvent={IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT}
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

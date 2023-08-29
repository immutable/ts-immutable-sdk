/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { ethers } from 'ethers';
import { WidgetTheme } from '../../lib';
import { LoadingView } from '../../views/loading/LoadingView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { text } from '../../resources/text/textConfig';
import {
  viewReducer,
  initialViewState,
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';

import { PaymentMethods } from './views/PaymentMethods';
import { ReviewOrder } from './views/ReviewOrder';
import { PayWithCard } from './views/PayWithCard';
import { PrimaryRevenueWidgetViews } from '../../context/view-context/PrimaryRevenueViewContextTypes';
import { TopUpView } from '../../views/top-up/TopUpView';
import { encodeApprove } from './functions/encodeApprove';

export interface PrimaryRevenueWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  fromContractAddress: string;
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const [mintResponse, setMintResponse] = useState<any | null>(null);
  const [mintError, setMintError] = useState(null);

  const {
    config, amount, fromContractAddress,
  } = props;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

  const { theme } = config;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const mount = useCallback(async () => {
    if (!checkout || !provider) return;

    try {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: PrimaryRevenueWidgetViews.PAYMENT_METHODS },
        },
      });
    } catch (error: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error,
          },
        },
      });
    }
  }, [checkout, provider]);

  // FIXME: Best way to check balances?
  const handleCheckBalances = useCallback(async () => {
    if (!checkout || !provider) return false;

    const walletAddress = await provider.getSigner().getAddress();
    const { formattedBalance } = await checkout.getBalance({
      provider,
      walletAddress,
      contractAddress: fromContractAddress,
    });

    const balance = parseFloat(formattedBalance);
    const requiredAmounts = parseFloat(amount);

    console.log('balance', balance);
    console.log('requiredAmounts', requiredAmounts);
    return balance > requiredAmounts;
  }, [checkout, provider, amount, fromContractAddress]);

  const prepareApprove = async () => {
    // Encode data
    const txData = encodeApprove(fromContractAddress, amount);

    // Prepare transaction
    const transaction = {
      from: '0x81064a5d163559D422fD311dc36c051424620EB9', // TODO: Remove hardcorded Guarded Multicaller address
      to: fromContractAddress,
      data: txData,
      gasLimit: 21000,
      gasPrice: ethers.utils.parseUnits('20', 'gwei'),
    };

    return transaction;
  };

  const handleApprove = useCallback(async () => {
    if (!checkout || !provider) return false;

    try {
      const transaction = await prepareApprove();
      const approved = await provider.send('eth_sendTransaction', [
        transaction,
      ]);

      return approved;
    } catch (error) {
      console.error(
        'An error occurred when executing approve function:',
        error,
      );
      return false;
    }
  }, [checkout, provider, amount, fromContractAddress]);

  const mint = useCallback(async () => {
    if (!provider) return;

    const recipient_address = await provider.getSigner().getAddress();

    const data = {
      contract_address: '0x81064a5d163559D422fD311dc36c051424620EB9',
      recipient_address,
      erc20_contract_address: '0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8',
      fee_collection_address: '0x862E424DE37B92cdf4F419713a54AA105DDB16b4',
      sale_collection_address: '0xB6E5b4C297D6B504F830d66093af4756A5Ba7985',
      amount,
      // items: items.map((item) => ({
      //   collection_address: item.contract_address,
      //   token_id: item.token_id.toString(),
      // })),
    };

    try {
      const response = await fetch(
        'https://game-primary-sales.sandbox.imtbl.com/v1/games/pokemon/mint',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-immutable-api-key': 'sk_imapik-Ekz6cLnnwREtqjGn$xo6_fb97b8',
          },
          body: JSON.stringify(data),
        },
      );

      const json = await response.json();
      setMintResponse(json);
      console.log('mintResponse', mintResponse);
    } catch (error) {
      setMintError(error as any);
      console.log('mintError', mintError);
    }
  }, [amount, fromContractAddress]);

  const executeBuyNow = useCallback(async () => {
    const approved = await handleApprove();
    console.log('approved', approved);

    if (approved) {
      mint();
    }

    return approved;
  }, [checkout, provider, amount, fromContractAddress]);

  useEffect(() => {
    if (!checkout || !provider) return;
    mount();
  }, [checkout, provider]);

  const handleGoBack = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: PrimaryRevenueWidgetViews.PAYMENT_METHODS },
      },
    });
  }, []);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={loadingText} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAYMENT_METHODS && (
          <PaymentMethods checkBalances={handleCheckBalances} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO && (
          <ReviewOrder executeBuyNow={executeBuyNow} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CARD && (
          <PayWithCard />
        )}
        {viewState.view.type === SharedViews.TOP_UP_VIEW && (
          <TopUpView
            widgetEvent={IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT}
            // FIXME: pass on config to enable/disable options
            showOnrampOption
            showSwapOption
            showBridgeOption
            onCloseButtonClick={handleGoBack}
            onBackButtonClick={handleGoBack}
          />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}

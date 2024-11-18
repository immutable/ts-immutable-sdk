import {
  useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AddTokensWidgetParams, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';

import { Stack, CloudImage, useTheme } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { sendAddTokensCloseEvent } from './AddTokensWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  AddTokensActions,
  AddTokensContext,
  addTokensReducer,
  initialAddTokensState,
} from './context/AddTokensContext';
import { AddTokensWidgetViews } from '../../context/view-context/AddTokensViewContextTypes';
import {
  initialViewState,
  SharedViews,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { AddTokens } from './views/AddTokens';
import { ErrorView } from '../../views/error/ErrorView';
import { useSquid } from './hooks/useSquid';
import {
  useAnalytics,
  UserJourney,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { fetchChains } from './functions/fetchChains';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { Review } from './views/Review';
import { fetchBalances } from './functions/fetchBalances';
import { useTokens } from './hooks/useTokens';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import { getRemoteImage } from '../../lib/utils';
import { isValidAddress } from '../../lib/validations/widgetValidators';
import { amountInputValidation } from '../../lib/validations/amountInputValidations';
import { useError } from './hooks/useError';
import { AddTokensErrorTypes } from './types';
import { ServiceUnavailableErrorView } from '../../views/error/ServiceUnavailableErrorView';

export type AddTokensWidgetInputs = Omit<AddTokensWidgetParams, 'toProvider'> & {
  config: StrongCheckoutWidgetsConfig;
};

export default function AddTokensWidget({
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  toTokenAddress,
  toAmount,
  showBackButton,
  config,
}: AddTokensWidgetInputs) {
  const fetchingBalances = useRef(false);
  const { base: { colorMode } } = useTheme();
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    view: { type: AddTokensWidgetViews.ADD_TOKENS },
    history: [{ type: AddTokensWidgetViews.ADD_TOKENS }],
  });
  const { t } = useTranslation();
  const { page } = useAnalytics();

  const viewReducerValues = useMemo(
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );

  const [addTokensState, addTokensDispatch] = useReducer(
    addTokensReducer,
    initialAddTokensState,
  );

  const {
    providersState: { checkout, fromProvider },
  } = useProvidersContext();

  const { squid, chains } = addTokensState;

  const addTokensReducerValues = useMemo(
    () => ({
      addTokensState,
      addTokensDispatch,
    }),
    [addTokensState, addTokensDispatch],
  );

  const squidSdk = useSquid(checkout);
  const tokensResponse = useTokens(checkout);
  const { showErrorHandover } = useError(checkout.config.environment);

  useEffect(() => {
    if (config.environment !== Environment.PRODUCTION) {
      showErrorHandover(AddTokensErrorTypes.ENVIRONMENT_ERROR);
    }
  }, [config]);

  useEffect(() => {
    if (!checkout) return;
    (async () => {
      addTokensDispatch({
        payload: {
          type: AddTokensActions.SET_IS_SWAP_AVAILABLE,
          isSwapAvailable: await checkout.isSwapAvailable(),
        },
      });
    })();
  }, [checkout]);

  useEffect(() => {
    const isInvalidToTokenAddress = toTokenAddress && !isValidAddress(toTokenAddress);
    const isInvalidToAmount = toAmount && !amountInputValidation(toAmount);

    if (isInvalidToTokenAddress || isInvalidToAmount) {
      showErrorHandover(AddTokensErrorTypes.INVALID_PARAMETERS);
    }
  }, [toTokenAddress, toAmount]);

  useEffect(() => {
    if (!squid) return;

    addTokensDispatch({
      payload: {
        type: AddTokensActions.SET_CHAINS,
        chains: fetchChains(squid),
      },
    });
  }, [squid]);

  useEffect(() => {
    if (!squid || !chains || !fromProvider || fetchingBalances.current) return;

    (async () => {
      try {
        fetchingBalances.current = true;
        const evmChains = chains.filter((chain) => chain.type === 'evm');
        const balances = await fetchBalances(squid, evmChains, fromProvider);

        addTokensDispatch({
          payload: {
            type: AddTokensActions.SET_BALANCES,
            balances,
          },
        });
      } finally {
        fetchingBalances.current = false;
      }
    })();
  }, [squid, chains, fromProvider]);

  useEffect(() => {
    if (!squidSdk) return;

    addTokensDispatch({
      payload: {
        type: AddTokensActions.SET_SQUID,
        squid: squidSdk,
      },
    });
  }, [squidSdk]);

  useEffect(() => {
    if (!tokensResponse) return;

    addTokensDispatch({
      payload: {
        type: AddTokensActions.SET_TOKENS,
        tokens: tokensResponse,
      },
    });
  }, [tokensResponse]);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const errorAction = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: AddTokensWidgetViews.ADD_TOKENS },
      },
    });
  };

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <AddTokensContext.Provider value={addTokensReducerValues}>
        <Stack sx={{ pos: 'relative' }}>
          <CloudImage
            use={(
              <img
                src={getRemoteImage(
                  config.environment,
                  `/add-tokens-bg-texture-${colorMode}.webp`,
                )}
                alt="blurry bg texture"
              />
            )}
            sx={{
              pos: 'absolute',
              h: '100%',
              w: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          {viewState.view.type === AddTokensWidgetViews.ADD_TOKENS && (
            <AddTokens
              config={config}
              checkout={checkout}
              toTokenAddress={toTokenAddress}
              toAmount={toAmount}
              showBackButton={showBackButton}
              showOnrampOption={showOnrampOption}
              showSwapOption={showSwapOption}
              showBridgeOption={showBridgeOption}
              onCloseButtonClick={() => sendAddTokensCloseEvent(eventTarget)}
              onBackButtonClick={() => {
                orchestrationEvents.sendRequestGoBackEvent(
                  eventTarget,
                  IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT,
                  {},
                );
              }}
            />
          )}
          {viewState.view.type === AddTokensWidgetViews.REVIEW && (
            <Review
              data={viewState.view.data}
              onCloseButtonClick={() => sendAddTokensCloseEvent(eventTarget)}
              onBackButtonClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.GO_BACK,
                  },
                });
              }}
              showBackButton
            />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={t('views.ERROR_VIEW.actionText')}
              onActionClick={errorAction}
              onCloseClick={() => sendAddTokensCloseEvent(eventTarget)}
              errorEventAction={() => {
                page({
                  userJourney: UserJourney.ADD_TOKENS,
                  screen: 'Error',
                });
              }}
            />
          )}
          {viewState.view.type
            === SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW && (
            <ServiceUnavailableErrorView
              onCloseClick={() => sendAddTokensCloseEvent(eventTarget)}
              onBackButtonClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.GO_BACK,
                  },
                });
              }}
            />
          )}
        </Stack>
      </AddTokensContext.Provider>
    </ViewContext.Provider>
  );
}

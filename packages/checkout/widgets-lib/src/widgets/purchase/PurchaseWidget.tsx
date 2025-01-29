import { IMTBLWidgetEvents, PurchaseItem, PurchaseWidgetParams } from '@imtbl/checkout-sdk';
import { CloudImage, Stack, useTheme } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  initialPurchaseState, PurchaseActions, PurchaseContext, purchaseReducer,
} from './context/PurchaseContext';
import { PurchaseWidgetViews } from '../../context/view-context/PurchaseViewContextTypes';
import {
  initialViewState,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { Purchase } from './views/Purchase';
import { sendPurchaseCloseEvent } from './PurchaseWidgetEvents';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { getRemoteImage } from '../../lib/utils';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';
import { fetchChains } from '../../lib/squid/functions/fetchChains';
import { useSquid } from '../../lib/squid/hooks/useSquid';
import { useTokens } from '../../lib/squid/hooks/useTokens';
import { useQuoteOrder } from '../../lib/hooks/useQuoteOrder';

export type PurchaseWidgetInputs = PurchaseWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
  items?: PurchaseItem[];
  environmentId: string;
};

export default function PurchaseWidget({
  config,
  environmentId,
  items,
  showBackButton,
}: PurchaseWidgetInputs) {
  const { base: { colorMode } } = useTheme();

  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    view: { type: PurchaseWidgetViews.PURCHASE },
    history: [{ type: PurchaseWidgetViews.PURCHASE }],
  });

  const {
    providersState: { checkout, toAddress },
  } = useProvidersContext();

  const viewReducerValues = useMemo(
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );

  const [purchaseState, purchaseDispatch] = useReducer(
    purchaseReducer,
    initialPurchaseState,
  );

  const purchaseReducerValues = useMemo(
    () => ({
      purchaseState,
      purchaseDispatch,
    }),
    [purchaseState, purchaseReducer],
  );

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { squid } = purchaseState;

  const squidSdk = useSquid(checkout);

  const tokensResponse = useTokens(checkout);

  const { fetchOrderQuote } = useQuoteOrder({
    environment: checkout.config.environment,
    environmentId,
  });

  useEffect(() => {
    if (!tokensResponse) return;
    purchaseDispatch({
      payload: {
        type: PurchaseActions.SET_SQUID_TOKENS,
        tokens: tokensResponse,
      },
    });
  }, [tokensResponse]);

  useEffect(
    () => {
      if (!items) return;

      purchaseDispatch({
        payload: {
          type: PurchaseActions.SET_ITEMS,
          items,
        },
      });
    },
    [items],
  );

  useEffect(() => {
    if (!squidSdk) return;
    purchaseDispatch({
      payload: {
        type: PurchaseActions.SET_SQUID,
        squid: squidSdk,
      },
    });
  }, [squidSdk]);

  useEffect(() => {
    if (!squid.squid) return;

    purchaseDispatch({
      payload: {
        type: PurchaseActions.SET_SQUID_CHAINS,
        chains: fetchChains(squid.squid),
      },
    });
  }, [squid.squid]);

  useEffect(() => {
    purchaseDispatch({
      payload: {
        type: PurchaseActions.SET_ID,
        id: uuidv4(),
      },
    });
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) return;

    (async () => {
      try {
        const quoteResponse = await fetchOrderQuote(items, toAddress);

        if (!quoteResponse) return;

        purchaseDispatch({
          payload: {
            type: PurchaseActions.SET_QUOTE,
            quote: quoteResponse,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching order quote', error);
      }
    })();
  }, [items, toAddress]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <PurchaseContext.Provider value={purchaseReducerValues}>
        <CryptoFiatProvider environment={checkout.config.environment}>
          <Stack sx={{ pos: 'relative' }}>
            <CloudImage
              use={(
                <img
                  src={getRemoteImage(
                    config.environment,
                    `/add-tokens-bg-texture-${colorMode}.webp`,
                  )}
                  alt="background texture"
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
            {viewState.view.type === PurchaseWidgetViews.PURCHASE && (
              <Purchase
                checkout={checkout}
                environmentId={environmentId!}
                showBackButton={showBackButton}
                onCloseButtonClick={() => sendPurchaseCloseEvent(eventTarget)}
                onBackButtonClick={() => {
                  orchestrationEvents.sendRequestGoBackEvent(
                    eventTarget,
                    IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT,
                    {},
                  );
                }}
              />
            )}
          </Stack>
        </CryptoFiatProvider>
      </PurchaseContext.Provider>
    </ViewContext.Provider>
  );
}

import { IMTBLWidgetEvents, PurchaseItem, PurchaseWidgetParams } from '@imtbl/checkout-sdk';
import { CloudImage, Stack, useTheme } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
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
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';

export type PurchaseWidgetInputs = PurchaseWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
  items?: PurchaseItem[];
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
    providersState: { checkout },
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

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <PurchaseContext.Provider value={purchaseReducerValues}>
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
      </PurchaseContext.Provider>
    </ViewContext.Provider>
  );
}

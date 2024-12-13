import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from 'react';
import { Checkout, EIP6963ProviderInfo, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { getProviderDetailByProvider } from '../../lib/provider/utils';
import { connectEIP6963Provider } from '../../lib/connectEIP6963Provider';

export interface ProvidersState {
  fromProvider?: WrappedBrowserProvider;
  fromProviderInfo?: EIP6963ProviderInfo;
  fromAddress?: string;
  toProvider?: WrappedBrowserProvider;
  toProviderInfo?: EIP6963ProviderInfo;
  toAddress?: string;
  checkout: Checkout;
  lockedToProvider?: boolean;
}

export const initialProvidersState: ProvidersState = {
  fromProvider: undefined,
  fromProviderInfo: undefined,
  fromAddress: undefined,
  toProvider: undefined,
  toProviderInfo: undefined,
  toAddress: undefined,
  checkout: {} as Checkout,
  lockedToProvider: false,
};

export interface ProvidersContextState {
  providersState: ProvidersState;
  providersDispatch: React.Dispatch<ProvidersContextAction>;
}

export interface ProvidersContextAction {
  payload: ProvidersContextActionPayload;
}

type ProvidersContextActionPayload =
  | SetProviderPayload
  | SetCheckoutPayload
  | ResetStatePayload
  | SetLockedToProviderPayload;

export enum ProvidersContextActions {
  SET_PROVIDER = 'SET_PROVIDER',
  SET_CHECKOUT = 'SET_CHECKOUT',
  RESET_STATE = 'RESET_STATE',
  SET_LOCKED_TO_PROVIDER = 'SET_LOCKED_TO_PROVIDER',
}

export interface SetProviderPayload {
  type: ProvidersContextActions.SET_PROVIDER;
  fromProvider?: WrappedBrowserProvider;
  fromProviderInfo?: EIP6963ProviderInfo;
  fromAddress?: string;
  toProvider?: WrappedBrowserProvider;
  toProviderInfo?: EIP6963ProviderInfo;
  toAddress?: string;
}

export interface SetCheckoutPayload {
  type: ProvidersContextActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface ResetStatePayload {
  type: ProvidersContextActions.RESET_STATE;
  fromProvider?: WrappedBrowserProvider;
  toProvider?: WrappedBrowserProvider;
  checkout: Checkout;
}

export interface SetLockedToProviderPayload {
  type: ProvidersContextActions.SET_LOCKED_TO_PROVIDER;
  lockedToProvider: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProvidersContext = createContext<ProvidersContextState>({
  providersState: initialProvidersState,
  providersDispatch: () => {},
});

ProvidersContext.displayName = 'ProvidersContext';

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const providersContextReducer: Reducer<
ProvidersState,
ProvidersContextAction
> = (state: ProvidersState, action: ProvidersContextAction) => {
  switch (action.payload.type) {
    case ProvidersContextActions.SET_PROVIDER:
      return {
        ...state,
        ...(action.payload.fromProvider && {
          fromProvider: action.payload.fromProvider,
        }),
        ...(action.payload.toProvider && {
          toProvider: action.payload.toProvider,
        }),
        ...(action.payload.fromProviderInfo && {
          fromProviderInfo: action.payload.fromProviderInfo,
        }),
        ...(action.payload.toProviderInfo && {
          toProviderInfo: action.payload.toProviderInfo,
        }),
        ...(action.payload.fromAddress && {
          fromAddress: action.payload.fromAddress,
        }),
        ...(action.payload.toAddress && {
          toAddress: action.payload.toAddress,
        }),
      };
    case ProvidersContextActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case 'RESET_STATE':
      return {
        ...initialProvidersState,
      };
    case ProvidersContextActions.SET_LOCKED_TO_PROVIDER:
      return {
        ...state,
        lockedToProvider: action.payload.lockedToProvider,
      };
    default:
      return state;
  }
};

export const useProvidersReducer = (initialState?: ProvidersState) => {
  const [providersState, providersDispatch] = useReducer(
    providersContextReducer,
    { ...initialProvidersState, ...(initialState ?? {}) },
  );

  return [providersState, providersDispatch] as const;
};

export function ProvidersContextProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: ProvidersState;
}) {
  const [providersState, providersDispatch] = useProvidersReducer(initialState);

  const value = useMemo(
    () => ({ providersState, providersDispatch }),
    [providersState, providersDispatch],
  );

  const { toProvider, checkout } = initialState;

  // if `toProvider` is passed, try to connect and get EIP6963 provider info
  useEffect(() => {
    if (!toProvider || providersState.lockedToProvider) return;

    (async () => {
      const injectedProviders = checkout.getInjectedProviders();
      const providerDetail = getProviderDetailByProvider(toProvider, [
        ...injectedProviders,
      ]);

      if (!providerDetail) return;

      try {
        await connectEIP6963Provider(providerDetail, checkout, false);
        const toAddress = await (await toProvider.getSigner()).getAddress();
        providersDispatch({
          payload: {
            type: ProvidersContextActions.SET_PROVIDER,
            toProvider,
            toAddress,
            toProviderInfo: providerDetail.info,
          },
        });
        providersDispatch({
          payload: {
            type: ProvidersContextActions.SET_LOCKED_TO_PROVIDER,
            lockedToProvider: true,
          },
        });
      } catch {
        /** TODO: handle error */
      }
    })();
  }, [toProvider, providersState.lockedToProvider]);

  return (
    <ProvidersContext.Provider value={value}>
      {children}
    </ProvidersContext.Provider>
  );
}

export const useProvidersContext = () => {
  const context = useContext(ProvidersContext);
  if (context === undefined) {
    // eslint-disable-next-line no-console
    console.error(
      'useProvidersContext must be used within a WidgetsContext.Provider',
    );
  }

  return context;
};

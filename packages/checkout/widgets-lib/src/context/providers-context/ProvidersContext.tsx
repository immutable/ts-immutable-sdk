import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk';

export interface ProvidersState {
  fromProvider?: Web3Provider;
  toProvider?: Web3Provider;
  checkout: Checkout;
}

export const initialProvidersState: ProvidersState = {
  fromProvider: undefined,
  toProvider: undefined,
  checkout: {} as Checkout,
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
  | ResetStatePayload;

export enum ProvidersContextActions {
  SET_PROVIDER = 'SET_PROVIDER',
  SET_CHECKOUT = 'SET_CHECKOUT',
  RESET_STATE = 'RESET_STATE',
}

export interface SetProviderPayload {
  type: ProvidersContextActions.SET_PROVIDER;
  toProvider: Web3Provider;
  fromProvider: Web3Provider;
}

export interface SetCheckoutPayload {
  type: ProvidersContextActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface ResetStatePayload {
  type: ProvidersContextActions.RESET_STATE;
  fromProvider?: Web3Provider;
  toProvider?: Web3Provider;
  checkout: Checkout;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProvidersContext = createContext<ProvidersContextState>({
  providersState: initialProvidersState,
  providersDispatch: () => {},
});

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
      };
    case ProvidersContextActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case 'RESET_STATE':
      return {
        ...initialProvidersState,
        ...action.payload,
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

  // Update the reducer when initialState changes
  useEffect(() => {
    providersDispatch({
      payload: {
        type: ProvidersContextActions.RESET_STATE,
        ...initialState,
      },
    });
  }, [initialState]);

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

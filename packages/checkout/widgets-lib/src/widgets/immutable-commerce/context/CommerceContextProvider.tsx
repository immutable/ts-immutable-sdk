import { ReactNode, useMemo, useReducer } from 'react';
import {
  CommerceContext,
  commerceReducer,
  initialCommerceState,
} from './CommerceContext';
import { useConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';

export const useCommerceWidgetState = () => {
  const [viewState, viewDispatch] = useReducer(
    commerceReducer,
    initialCommerceState,
  );

  return [viewState, viewDispatch] as const;
};

type CommerceContextProviderProps = {
  children: ReactNode;
};

export function CommerceWidgetContextProvicer({
  children,
}: CommerceContextProviderProps) {
  const [{ checkout, provider }] = useConnectLoaderState();
  const [commerceState, commerceDispatch] = useCommerceWidgetState();

  const values = useMemo(
    () => ({
      commerceState: { ...commerceState, checkout, provider },
      commerceDispatch,
    }),
    [commerceState, commerceDispatch, checkout, provider],
  );

  return (
    <CommerceContext.Provider value={values}>
      {children}
    </CommerceContext.Provider>
  );
}

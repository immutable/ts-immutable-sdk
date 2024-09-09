import { ReactNode, useEffect } from 'react';
import { AddFundsActions, useAddFundsValues, AddFundsContext } from './AddFundsContext';
import { useSquid } from '../hooks/useSquid';

export function AddFundsContextProvider({ children }: { children: ReactNode }) {
  const addFundsValue = useAddFundsValues();
  const { addFundsState, addFundsDispatch } = addFundsValue;

  const squid = useSquid();

  useEffect(() => {
    if (!squid || addFundsState.squid) return;

    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_SQUID,
        squid,
      },
    });
  }, [squid]);

  return (
    <AddFundsContext.Provider value={addFundsValue}>
      {children}
    </AddFundsContext.Provider>
  );
}

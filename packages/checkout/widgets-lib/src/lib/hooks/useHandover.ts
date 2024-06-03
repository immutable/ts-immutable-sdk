import { useContext, useCallback, useMemo } from 'react';
import { HandoverContext } from '../../context/handover-context/HandoverContext';

export const useHandover = ({ id }: { id?: string } = {}) => {
  const context = useContext(HandoverContext);
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider');
  }

  const {
    handovers,
    closeHandover,
    addHandover,
    loader,
    isLoading,
    showLoader,
    hideLoader,
  } = context;
  const handover = useMemo(() => handovers[id ?? 'global'], [id, handovers]);
  const getHandover = useCallback((handoverId: string) => handovers[handoverId], [handovers]);

  return {
    loader,
    isLoading,
    showLoader,
    hideLoader,
    handover,
    getHandover,
    addHandover,
    closeHandover,
  };
};

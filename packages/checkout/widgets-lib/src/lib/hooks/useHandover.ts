import { useContext, useCallback, useMemo } from 'react';
import { HandoverContent } from 'context/handover-context/HandoverContext';
import { HandoverContext } from '../../context/handover-context/HandoverContext';

export const useHandover = ({ id }: { id?: string } = {}) => {
  const context = useContext(HandoverContext);
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider');
  }

  const { handovers, setHandovers } = context;
  const handover = useMemo(() => handovers[id ?? 'global'], [id, handovers]);

  const getHandover = useCallback((handoverId: string) => handovers[handoverId], [handovers]);

  const addHandover = useCallback(
    (handoverId: string, handoverContent: HandoverContent) => {
      setHandovers((prev) => ({ ...prev, [handoverId]: handoverContent }));
    },
    [setHandovers],
  );

  const closeHandover = useCallback(
    (handoverId: string) => {
      setHandovers((prev) => {
        const newHandovers = { ...prev };
        delete newHandovers[handoverId];
        return newHandovers;
      });
    },
    [setHandovers],
  );

  return {
    handover,
    handovers,
    getHandover,
    addHandover,
    closeHandover,
  };
};

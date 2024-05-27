import { useContext, useCallback } from 'react';
import { Handover } from 'context/handover-context/HandoverContext';
import { HandoverContext } from '../../context/handover-context/HandoverContext';

export const useHandover = () => {
  const context = useContext(HandoverContext);
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider');
  }

  const { handovers, setHandovers } = useContext(HandoverContext);

  const getHandover = useCallback((id: string) => handovers[id], [handovers]);

  const addHandover = useCallback(
    (id: string, handover: Handover) => {
      setHandovers((prev) => ({ ...prev, [id]: handover }));
    },
    [setHandovers],
  );

  const closeHandover = useCallback(
    (id: string) => {
      setHandovers((prev) => {
        const newHandovers = { ...prev };
        delete newHandovers[id];
        return newHandovers;
      });
    },
    [setHandovers],
  );

  return {
    handovers,
    getHandover,
    addHandover,
    closeHandover,
  };
};

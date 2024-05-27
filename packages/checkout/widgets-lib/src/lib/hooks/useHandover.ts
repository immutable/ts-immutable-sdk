import { useContext, useCallback } from 'react';
import { Handover } from 'context/handover-context/HandoverContext';
import { HandoverContext } from '../../context/handover-context/HandoverContext';

const useHandover = () => {
  const context = useContext(HandoverContext);
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider');
  }

  const { handovers, setHandovers } = useContext(HandoverContext);

  const addHandover = useCallback(
    (id: string, handover: Handover) => {
      setHandovers((prev) => ({ ...prev, [id]: handover }));
    },
    [setHandovers],
  );

  const removeHandover = useCallback(
    (id: string) => {
      setHandovers((prev) => {
        const newHandovers = { ...prev };
        delete newHandovers[id];
        return newHandovers;
      });
    },
    [setHandovers],
  );

  const startHandover = useCallback((id: string) => {
    console.log(`Starting handover: ${id}`);
    // logic for starting the handover
  }, []);

  const stopHandover = useCallback((id: string) => {
    console.log(`Stopping handover: ${id}`);
    // logic for stopping the handover
  }, []);

  return {
    handovers,
    addHandover,
    removeHandover,
    startHandover,
    stopHandover,
  };
};

export default useHandover;

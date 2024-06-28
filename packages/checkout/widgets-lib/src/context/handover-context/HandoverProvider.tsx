/* eslint-disable no-console */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  HandoverContent,
  HandoverContext,
  HandoverLoader,
  HandoverTarget,
} from './HandoverContext';
import { Handover } from '../../components/Handover/Handover';

interface HandoverProviderProps {
  children: React.ReactNode;
}

type HandoverState = {
  [key in HandoverTarget]?: HandoverContent;
};

type HandoverQueue = {
  [key in HandoverTarget]?: HandoverContent[];
};

export enum HandoverDuration {
  SHORT = 1000, // in milliseconds
  MEDIUM = 2000,
  LONG = 3000,
}

export function HandoverProvider({ children }: HandoverProviderProps) {
  const [handovers, setHandovers] = useState<HandoverState>({});
  const [handoverQueue, setHandoverQueue] = useState<HandoverQueue>({});
  const [handoverBusy, setHandoverBusy] = useState<{
    [key in HandoverTarget]?: boolean;
  }>({});

  const [loader, setLoader] = useState<HandoverLoader | null>(null);
  const isLoading = useMemo(() => loader !== null, [loader]);
  const hideLoader = useCallback(() => {
    setLoader(null);
  }, [setLoader]);

  const closeHandover = useCallback(
    (handoverId: HandoverTarget = HandoverTarget.GLOBAL) => {
      setHandovers((prev) => {
        const newHandovers = { ...prev };
        const handoverContent = newHandovers[handoverId];

        delete newHandovers[handoverId];

        if (handoverContent?.onClose) {
          handoverContent.onClose();
        }
        return newHandovers;
      });
    },
    [setHandovers],
  );

  const processQueue = useCallback(
    (handoverId: HandoverTarget, autoClose: boolean = false) => {
      if (handoverBusy[handoverId]) return;

      const updatedQueue = { ...handoverQueue };
      const queuedContent = updatedQueue[handoverId] ?? [];
      if (queuedContent.length > 0) {
        const nextHandoverContent = queuedContent.shift();

        if (nextHandoverContent) {
          setHandovers((prev) => ({
            ...prev,
            [handoverId]: nextHandoverContent,
          }));

          const contentDuration = nextHandoverContent.duration ?? 0;
          const effectiveDuration = Math.max(contentDuration, HandoverDuration.SHORT);

          setHandoverBusy((prev) => ({
            ...prev,
            [handoverId]: true,
          }));

          setTimeout(() => {
            setHandoverBusy((prev) => ({
              ...prev,
              [handoverId]: false,
            }));
          }, effectiveDuration);
        } else {
          delete updatedQueue[handoverId];
          if (autoClose) {
            closeHandover(handoverId);
          }
          setHandoverQueue(updatedQueue);
        }
      } else {
        const currentHandover = handovers[handoverId];
        if (currentHandover?.duration && currentHandover.duration > 0) {
          closeHandover(handoverId);
        }
      }
    },
    [handoverQueue, handoverBusy, handovers, closeHandover],
  );

  const addHandover = (
    handoverContent: HandoverContent,
    handoverId: HandoverTarget = HandoverTarget.GLOBAL,
  ) => {
    setHandoverQueue((prevQueue) => {
      const updatedQueue = { ...prevQueue };
      const queuedContent = [...(updatedQueue[handoverId] ?? [])];
      queuedContent.push(handoverContent);
      updatedQueue[handoverId] = queuedContent;
      return updatedQueue;
    });
  };

  useEffect(() => {
    Object.keys(handoverQueue).forEach((handoverId) => {
      processQueue(handoverId as HandoverTarget);
    });
  }, [handoverQueue, handoverBusy, processQueue]);

  const value = useMemo(
    () => ({
      loader,
      isLoading,
      hideLoader,
      showLoader: (handoverLoader: HandoverLoader) => {
        const text = Array.isArray(handoverLoader.text)
          ? handoverLoader.text
          : [handoverLoader.text];
        setLoader({ ...handoverLoader, text: [...text] });
      },
      handovers,
      addHandover,
      closeHandover,
    }),
    [loader, isLoading, hideLoader, handovers, addHandover, closeHandover],
  );

  return (
    <HandoverContext.Provider value={value}>
      <Handover id="global">{children}</Handover>
    </HandoverContext.Provider>
  );
}

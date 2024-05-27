import React, { useMemo, useState } from 'react';
import { Handover, HandoverContext } from './HandoverContext';

interface HandoverProviderProps {
  children: React.ReactNode;
}

export enum HandoverType {
  GLOBAL = 'global',
  DRAWER = 'drawer',
  LOADER = 'loader',
}

type HandoverState = {
  [key in HandoverType]?: Handover;
};

export function HandoverProvider({ children }: HandoverProviderProps) {
  const [handovers, setHandovers] = useState<HandoverState>({});

  const value = useMemo(() => ({ handovers, setHandovers }), [handovers]);

  return (
    <HandoverContext.Provider value={value}>
      {children}
    </HandoverContext.Provider>
  );
}

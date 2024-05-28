import React, { useMemo, useState } from 'react';
import { HandoverContent, HandoverContext } from './HandoverContext';
import { Handover } from '../../components/Handover/Handover';

interface HandoverProviderProps {
  children: React.ReactNode;
}

export enum HandoverType {
  GLOBAL = 'global',
  DRAWER = 'drawer',
  LOADER = 'loader',
}

type HandoverState = {
  [key in HandoverType]?: HandoverContent;
};

export function HandoverProvider({ children }: HandoverProviderProps) {
  const [handovers, setHandovers] = useState<HandoverState>({});

  const value = useMemo(() => ({ handovers, setHandovers }), [handovers]);

  return (
    <HandoverContext.Provider value={value}>
      <Handover id="global">
        {children}
      </Handover>
    </HandoverContext.Provider>
  );
}

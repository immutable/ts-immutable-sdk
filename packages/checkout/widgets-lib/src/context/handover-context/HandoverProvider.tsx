import React, { useMemo, useState } from 'react';
import { Handover, HandoverContext } from './HandoverContext';

interface HandoverProviderProps {
  children: React.ReactNode;
}

export function HandoverProvider({ children }: HandoverProviderProps) {
  const [handovers, setHandovers] = useState<{ [id: string]: Handover }>({});

  const value = useMemo(() => ({ handovers, setHandovers }), [handovers]);

  return (
    <HandoverContext.Provider value={value}>
      {children}
    </HandoverContext.Provider>
  );
}

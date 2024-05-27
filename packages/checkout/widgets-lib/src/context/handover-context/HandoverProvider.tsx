import React, { useMemo, useState } from 'react';
import { Checkout } from '@imtbl/checkout-sdk';
import { HandoverContent, HandoverContext } from './HandoverContext';
import { Handover } from '../../components/Handover/Handover';

interface HandoverProviderProps {
  children: React.ReactNode;
  checkout: Checkout;
}

export enum HandoverType {
  GLOBAL = 'global',
  DRAWER = 'drawer',
  LOADER = 'loader',
}

type HandoverState = {
  [key in HandoverType]?: HandoverContent;
};

export function HandoverProvider({ children, checkout }: HandoverProviderProps) {
  const [handovers, setHandovers] = useState<HandoverState>({});

  const value = useMemo(() => ({ handovers, setHandovers }), [handovers]);

  return (
    <HandoverContext.Provider value={value}>
      <Handover id="global" checkout={checkout}>
        {children}
      </Handover>
    </HandoverContext.Provider>
  );
}

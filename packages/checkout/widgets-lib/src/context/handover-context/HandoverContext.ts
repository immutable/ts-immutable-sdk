import React, { createContext } from 'react';

export enum HandoverTarget {
  GLOBAL = 'global',
  DRAWER = 'drawer',
  LOADER = 'loader',
}

export interface HandoverContent {
  children?: React.ReactNode;
  animationUrl?: string;
  animationName?: string;
  onAnimationComplete?: () => void;
  duration?: number; // in milliseconds
}

interface HandoverContextProps {
  handovers: { [id: string]: HandoverContent };
  addHandover: (handoverContent: HandoverContent, handoverTarget?: HandoverTarget) => void;
  closeHandover: (handoverTarget?: HandoverTarget) => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HandoverContext = createContext<HandoverContextProps>({
  handovers: {},
  addHandover: () => {},
  closeHandover: () => {},
});

import React, { createContext } from 'react';

export interface HandoverContent {
  children: React.ReactNode;
  animationUrl?: string;
  animationState?: string;
  onAnimationComplete?: () => void;
}

interface HandoverContextProps {
  handovers: { [id: string]: HandoverContent };
  setHandovers: React.Dispatch<
  React.SetStateAction<{ [id: string]: HandoverContent }>
  >;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HandoverContext = createContext<HandoverContextProps>({
  handovers: {},
  setHandovers: () => {},
});

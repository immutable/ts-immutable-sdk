import React, { createContext } from 'react';

export interface Handover {
  children: React.ReactNode;
  animationUrl?: string;
  animationState?: string;
  onAnimationComplete?: () => void;
}

interface HandoverContextProps {
  handovers: { [id: string]: Handover };
  setHandovers: React.Dispatch<
  React.SetStateAction<{ [id: string]: Handover }>
  >;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HandoverContext = createContext<HandoverContextProps>({
  handovers: {},
  setHandovers: () => {},
});

import React, { createContext } from 'react';

export enum HandoverTarget {
  GLOBAL = 'global',
  DRAWER = 'drawer',
  LOADER = 'loader',
}

export type HandoverContent = {
  children?: React.ReactNode;
  animationUrl?: string;
  animationName?: string;
  duration?: number; // in milliseconds
  onClose?: () => void;
};

export type HandoverLoader = {
  text: string | string[];
  duration?: number;
};

export type HandoverContextProps = {
  loader: HandoverLoader | null;
  isLoading: boolean;
  showLoader: (loader: HandoverLoader) => void;
  hideLoader: () => void;
  handovers: { [id: string]: HandoverContent };
  addHandover: (handoverContent: HandoverContent, handoverTarget?: HandoverTarget) => void;
  closeHandover: (handoverTarget?: HandoverTarget) => void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HandoverContext = createContext<HandoverContextProps>({
  loader: null,
  isLoading: false,
  showLoader: () => {},
  hideLoader: () => {},
  handovers: {},
  addHandover: () => {},
  closeHandover: () => {},
});

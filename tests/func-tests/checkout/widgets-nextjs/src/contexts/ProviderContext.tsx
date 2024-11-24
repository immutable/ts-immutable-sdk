import { createContext, useContext, ReactNode } from 'react';

interface ProviderContextType {
  provider: any | undefined;
}

const ProviderContext = createContext<ProviderContextType>({ provider: undefined });

export function ProviderContextProvider({
  children,
  provider
}: {
  children: ReactNode;
  provider: any;
}) {
  return (
    <ProviderContext.Provider value={{ provider }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  return useContext(ProviderContext).provider;
} 
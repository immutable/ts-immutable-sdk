'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { passport } from '@imtbl/sdk';
import { passportInstance } from './setupDefault';

interface AppContextType {
  selectedPassportInstance: passport.Passport;
  setSelectedPassportInstance: (instance: passport.Passport) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  userInfo: any;
  setUserInfo: (userInfo: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppWrapper({ children }: { children: ReactNode }) {
  const [selectedPassportInstance, setSelectedPassportInstance] = useState<passport.Passport>(passportInstance);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  return (
    <AppContext.Provider
      value={{
        selectedPassportInstance,
        setSelectedPassportInstance,
        isAuthenticated,
        setIsAuthenticated,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppWrapper');
  }
  return context;
} 
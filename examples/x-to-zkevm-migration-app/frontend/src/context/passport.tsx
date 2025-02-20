"use client";

import { config, passport } from '@imtbl/sdk';
import { IMXProvider } from '@imtbl/sdk/x';
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type PassportContextType = {
    passportInstance?: passport.Passport;
    passportSilentInstance?: passport.Passport;
    imxWalletAddress?: string;
    login?: () => void;
    logout?: () => void;
    getUserInfo?: () => Promise<passport.UserProfile | null>;
    getLinkedAddresses?: () => Promise<string[] | null>;
    burn?: (nfts: { tokenId: string; tokenAddress: string }[]) => Promise<void>;
  };

const PassportContext = createContext<PassportContextType>({});

export function PassportProvider({ children }: { children: React.ReactNode }) {
    const [imxWalletAddress, setImxWalletAddress] = useState<string | undefined>();
    const [imxProvider, setImxProvider] = useState<IMXProvider | undefined>();
    const passportInstance = useMemo(() => new passport.Passport({
        baseConfig: {
          environment: config.Environment.SANDBOX,
        },
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
        redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
        logoutRedirectUri: 'http://localhost:3000/logout', // replace with one of your logout URIs from Hub
        audience: 'platform_api',
        scope: 'openid offline_access email transact',
      }), []);

    const login = useCallback(async () => {
        if (!passportInstance) {
            console.log('login: No passport instance available');
            return;
        }
        try {
            const imxProvider: IMXProvider = await passportInstance.connectImx();
            setImxProvider(imxProvider);
            const isRegistered = await imxProvider.isRegisteredOffchain();
            if (!isRegistered) {
                await imxProvider.registerOffchain();
            }
            const imxWalletAddress = await imxProvider.getAddress();
            setImxWalletAddress(imxWalletAddress);
            console.log('login: Successfully connected, imxWalletAddress:', imxWalletAddress);
        } catch (error) {
            console.error('login: Error connecting', error);
        }
    }, [passportInstance]);

    const logout = useCallback(async () => {
        if (!passportInstance) {
            console.log('logout: No passport instance available');
            return;
        }
        try {
            await passportInstance.logout();
            console.log('logout: Successfully logged out');
        } catch (error) {
            console.error('logout: Error logging out', error);
        }
    }, [passportInstance]);

    const getUserInfo = useCallback(async (): Promise<passport.UserProfile | null> => {
      if (!passportInstance) {
          console.log('getUserInfo: No passport instance available');
          return null;
      }
      try {
          const userProfile = await passportInstance.getUserInfo();
          console.log('getUserInfo: User profile retrieved', userProfile);
          return userProfile ?? null;
      } catch (error) {
          console.error('getUserInfo: Error getting user info', error);
          return null;
      }
  }, [passportInstance]);

    const getLinkedAddresses = useCallback(async (): Promise<string[] | null> => {
        if (!passportInstance) {
            console.log('getLinkedAddresses: No passport instance available');
            return null;
        }
        try {
            const linkedAddresses = await passportInstance.getLinkedAddresses();
            console.log('getLinkedAddresses: Linked addresses retrieved', linkedAddresses);
            return linkedAddresses;
        } catch (error) {
            console.error('getLinkedAddresses: Error getting linked addresses', error);
            return null;
        }
    }, [passportInstance]);

    const burn = useCallback(async (nfts: { tokenId: string; tokenAddress: string }[]): Promise<void> => {
        if (!passportInstance || !imxWalletAddress) {
            console.log('burn: No passport instance or wallet address available');
            return;
        }
        try {
            if (imxProvider) {
                await imxProvider.batchNftTransfer(
                    nfts.map((nft) => ({
                        receiver: process.env.NEXT_PUBLIC_BURN_ADDRESS || '',
                        tokenId: nft.tokenId,
                        tokenAddress: nft.tokenAddress,
                    }))
                );
            } else {
                console.log('burn: No imxProvider available');
                return;
            }
            
            console.log('burn: Successfully burned tokens');
        } catch (error) {
            console.error('burn: Error burning tokens', error);
        }
    }, [passportInstance, imxWalletAddress, imxProvider]);

    const providerValue = useMemo(() => {
        console.log('PassportProvider: Creating provider value');
        return {
            passportInstance,
            imxWalletAddress,
            login,
            logout,
            getUserInfo,
            getLinkedAddresses,
            burn,
        };
    }, [
        passportInstance,
        imxWalletAddress,
        login,
        logout,
        getUserInfo,
        getLinkedAddresses,
        burn,
    ]);
    
      return (
        <PassportContext.Provider value={providerValue}>
          {children}
        </PassportContext.Provider>
      );
    }
    
    export const usePassport = () => {
        return useContext(PassportContext);
    };
"use client";

import { blockchainData, config } from '@imtbl/sdk';
import { createContext, useCallback, useContext, useMemo } from "react";

type ContextType = {
    listAssets?: (userAddress: string) => Promise<blockchainData.Types.ListNFTsResult>;
};

const Context = createContext<ContextType>({});

export function ZkEVMProvider({ children }: { children: React.ReactNode }) {
    console.log('Provider: Initializing');
    const client = useMemo(() => new blockchainData.BlockchainData({
        baseConfig: {
            environment: config.Environment.SANDBOX,
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
        },
    }), []);

    const listAssets = useCallback(async (userAddress: string): Promise<blockchainData.Types.ListNFTsResult> => {
        console.log('listAssets: Attempting to list assets for user', userAddress);
        try {
            const assets = await client.listNFTsByAccountAddress({
                accountAddress: userAddress,
                chainName: 'imtbl-zkevm-testnet',
            });
            console.log('listAssets: Assets retrieved', assets);
            return assets as unknown as blockchainData.Types.ListNFTsResult;
        } catch (error) {
            console.error('listAssets: Error listing assets', error);
            throw error;
        }
    }, [client]);

    const providerValue = useMemo(() => {
        console.log('Provider: Creating provider value');
        return {
            listAssets,
        };
    }, [listAssets]);

    return (
        <Context.Provider value={providerValue}>
            {children}
        </Context.Provider>
    );
}

export const useZkEVM = () => {
    console.log('useZkEVM: Hook called');
    return useContext(Context);
};
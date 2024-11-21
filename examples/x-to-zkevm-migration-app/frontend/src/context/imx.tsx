"use client";

import { config, x } from '@imtbl/sdk';
import { createContext, useCallback, useContext, useMemo } from "react";

type IMXContextType = {
    listAssets?: (userAddress: string) => Promise<x.ListAssetsResponse>;
};

const IMXContext = createContext<IMXContextType>({});

export function IMXProvider({ children }: { children: React.ReactNode }) {
    const client = useMemo(() => new x.IMXClient(x.imxClientConfig({ environment: config.Environment.SANDBOX })), []);
    
    const listAssets = useCallback(async (userAddress: string): Promise<x.ListAssetsResponse> => {
        console.log('listAssets: Attempting to list assets for user', userAddress);
        try {
            const assets = await client.listAssets({
                user: userAddress,
            });
            console.log('listAssets: Assets retrieved', assets);
            return assets;
        } catch (error) {
            console.error('listAssets: Error listing assets', error);
            throw error;
        }
    }, [client]);

    const providerValue = useMemo(() => {
        return {
            listAssets,
        };
    }, [listAssets]);

    return (
        <IMXContext.Provider value={providerValue}>
            {children}
        </IMXContext.Provider>
    );
}

export const useIMX = () => {
    return useContext(IMXContext);
};
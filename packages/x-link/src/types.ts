import { ProviderPreference } from "@imtbl/imx-sdk";

export interface SetupOptions {
    providerPreference?: ProviderPreference;
}

export interface SetupResult {
    address: string;
    starkPublicKey: string;
    ethNetwork: string;
    providerPreference: string;
    email?: string;
}
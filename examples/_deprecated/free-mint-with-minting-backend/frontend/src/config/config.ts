import { Environment } from "@imtbl/sdk/x";

export const applicationEnvironment = import.meta.env.VITE_IMMUTABLE_ENVIRONMENT === Environment.PRODUCTION
  ? Environment.PRODUCTION
  : Environment.SANDBOX

const config = {
  [Environment.SANDBOX]: {
    immutablePublishableKey: import.meta.env.VITE_SANDBOX_IMMUTABLE_PUBLISHABLE_KEY,
    passportClientId: import.meta.env.VITE_SANDBOX_PASSPORT_CLIENT_ID,
    passportRedirectUri: import.meta.env.VITE_SANDBOX_PASSPORT_LOGIN_REDIRECT_URI,
    passportLogoutRedirectUri: import.meta.env.VITE_SANDBOX_PASSPORT_LOGOUT_REDIRECT_URI,
    immutableApiBaseUrl: import.meta.env.VITE_SANDBOX_IMMUTABLE_API_BASE_URL,
    mintingBackendApiBaseUrl: import.meta.env.VITE_MINTING_BACKEND_API_BASE_URL,
    explorerUrl: "https://explorer.testnet.immutable.com",
  },
  [Environment.PRODUCTION]: {
    immutablePublishableKey: import.meta.env.VITE_MAINNET_IMMUTABLE_PUBLISHABLE_KEY,
    passportClientId: import.meta.env.VITE_MAINNET_PASSPORT_CLIENT_ID,
    passportRedirectUri: import.meta.env.VITE_MAINNET_PASSPORT_LOGIN_REDIRECT_URI,
    passportLogoutRedirectUri: import.meta.env.VITE_MAINNET_PASSPORT_LOGOUT_REDIRECT_URI,
    immutableApiBaseUrl: import.meta.env.VITE_MAINNET_IMMUTABLE_API_BASE_URL,
    mintingBackendApiBaseUrl: import.meta.env.VITE_MINTING_BACKEND_API_BASE_URL,
    explorerUrl: "https://explorer.immutable.com",
  },
};

export default config;

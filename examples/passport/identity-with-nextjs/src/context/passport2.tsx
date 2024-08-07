import { config, passport } from "@imtbl/sdk";
import { ReactNode } from "react";

// #doc passport-provider-react
export const PassportProvider = ({ children }: { children: ReactNode }) => (
  <passport.PassportProvider
    config={{
      baseConfig: {
        environment: config.Environment.SANDBOX, // or config.Environment.SANDBOX
        publishableKey: 'pk_imapik-test-I-oW1KvOhekGJlCmzovH'
          // process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || "<YOUR_PUBLISHABLE_KEY>", // replace with your publishable API key from Hub
      },
      clientId: '1z08tw7t43zLvMsO2xHmbvg54qZB0XIp', // process.env.NEXT_PUBLIC_CLIENT_ID || "<YOUR_CLIENT_ID>", // replace with your client ID from Hub
      redirectUri: "http://localhost:3000/redirect", // replace with one of your redirect URIs from Hub
      logoutRedirectUri: "http://localhost:3000/logout", // replace with one of your logout URIs from Hub
      audience: "platform_api",
      scope: "openid offline_access email transact",
    }}
  >
    {children}
  </passport.PassportProvider>
);
// #enddoc passport-provider-react
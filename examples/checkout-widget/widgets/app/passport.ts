import { config, passport } from "@imtbl/sdk";

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
  },
  clientId: 'UnB98ngnXIZIEJWGJOjVe1BpCx5ix7qc',
  redirectUri: "http://localhost:3000/redirect", // replace with one of your redirect URIs from Hub
  logoutRedirectUri: "http://localhost:3000/logout", // replace with one of your logout URIs from Hub
  audience: "platform_api",
  scope: "openid offline_access email transact",
});

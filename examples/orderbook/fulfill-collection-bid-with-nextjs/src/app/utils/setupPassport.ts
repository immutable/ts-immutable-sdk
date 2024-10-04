import { config, passport } from "@imtbl/sdk";

// create the Passport instance and export it so it can be used in the examples
export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: 'pk_imapik-test-8TcN6RHNO-@Q45qv71_Y' ?? "<NEXT_PUBLIC_PUBLISHABLE_KEY>", // replace with your publishable API key from Hub
  },
  clientId: 'IFiS7FVoeygAVspumXqEeN9G5Vh2waDO' ?? "<NEXT_PUBLIC_CLIENT_ID>", // replace with your client ID from Hub
  redirectUri: "http://localhost:3000/redirect", // replace with one of your redirect URIs from Hub
  logoutRedirectUri: "http://localhost:3000/logout", // replace with one of your logout URIs from Hub
  audience: "platform_api",
  scope: "openid offline_access email transact",
  popupOverlayOptions: {
    disableGenericPopupOverlay: false, // Set to true to disable the generic pop-up overlay
    disableBlockedPopupOverlay: false, // Set to true to disable the blocked pop-up overlay
  },
});

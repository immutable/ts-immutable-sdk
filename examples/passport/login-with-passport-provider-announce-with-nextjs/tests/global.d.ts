interface Window {
  __coverage__: any;
  passportInstance: any;
  mockPassportLogin: () => Promise<void>;
  mockConnectEvm: () => Promise<any>;
  providerCallbacks: Record<string, any>;
} 
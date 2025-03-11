import { config } from '@imtbl/sdk';
import { PassportProvider } from '@imtbl/sdk/passport';
import { ReactNode } from 'react';

const passportConfig = {
  baseConfig: new config.ImmutableConfiguration({
    environment: config.Environment.SANDBOX,
  }),
};

export const AppWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <PassportProvider config={passportConfig}>
      {children}
    </PassportProvider>
  );
}; 
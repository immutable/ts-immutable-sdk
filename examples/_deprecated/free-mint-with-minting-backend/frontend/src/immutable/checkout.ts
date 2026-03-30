import { checkout } from '@imtbl/sdk';
import { ImmutableConfiguration } from '@imtbl/sdk/x';
import appConfig, { applicationEnvironment } from '../config/config';
import { passportInstance } from './passport';

export const checkoutInstance = new checkout.Checkout({
  baseConfig: new ImmutableConfiguration({
    environment: applicationEnvironment,
  }),
  passport: passportInstance,
  publishableKey: appConfig[applicationEnvironment].immutablePublishableKey
});
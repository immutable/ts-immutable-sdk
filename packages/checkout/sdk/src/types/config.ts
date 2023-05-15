import { Environment, ModuleConfiguration } from '@imtbl/config';

export const SANDBOX_CONFIGURATION = {
  baseConfig: {
    environment: Environment.SANDBOX,
  },
};

export interface CheckoutOverrides {}
export interface CheckoutModuleConfiguration extends ModuleConfiguration<CheckoutOverrides> {
}

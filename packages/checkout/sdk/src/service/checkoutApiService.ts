import { Environment } from '@imtbl/config';
import { CheckoutApiServiceL1RpcNode } from './checkoutApiServiceL1RpcNode';

export type CheckoutServiceApiParams = {
  environment: Environment;
};

export class CheckoutServiceApi {
  private readonly environment: Environment;

  constructor({ environment }: CheckoutServiceApiParams) {
    this.environment = environment;
  }

  getL1RpcNode() {
    return new CheckoutApiServiceL1RpcNode({ environment: this.environment });
  }
}

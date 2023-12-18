import { strict as assert } from 'assert';
import { repeatCheck } from '../lib/utils';

import { SharedState } from './shared-state';

export class Chains {
  constructor(protected sharedState: SharedState) {}

  // @then('sdk should list chains', undefined, DEFAULT_TIMEOUT)
  public async listChains() {
    await repeatCheck(60)(async () => {
      const chains = await this.sharedState.blockchainData.listChains({});
      console.log(JSON.stringify(chains.result, null, 2));
      assert.ok(chains.result);
    });
  }
}

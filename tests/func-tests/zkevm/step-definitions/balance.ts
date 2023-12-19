import { strict as assert } from 'assert';

import { SharedState } from './shared-state';

export class Balance {
  constructor(protected sharedState: SharedState) {}

  // @given('{string} has at least {string} IMX', undefined, DEFAULT_TIMEOUT)
  public async deployerHasImx(actor: string, amount: string) {
    switch (actor) {
      case 'deployer':
      case 'minter':
      case 'buyer':
      case 'seller':
      case 'spender':
        await this.sharedState.topUpIfNecessary(
          this.sharedState[actor].address,
          amount,
        );
        break;
      default:
        assert.fail(`Unknown actor ${actor}`);
    }
  }
}

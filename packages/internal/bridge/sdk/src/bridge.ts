import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import { BridgeDepositRequest, BridgeDepositResponse } from 'types';
import RootERC20Predicate from 'contracts/ABIs/RootERC20Predicate.json';
import { BridgeError, BridgeErrorType } from 'errors';

export class Bridge {
  private config: BridgeConfiguration;

  constructor(config: BridgeConfiguration) {
    this.config = config;
  }

  public async getUnsignedDepositTx(
    req: BridgeDepositRequest
  ): Promise<BridgeDepositResponse> {
    if (req.token === 'NATIVE') {
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR
      );
    }

    const rootERC20PredicateContract = new ethers.Contract(
      this.config.bridgeContracts.rootChainERC20Predicate,
      RootERC20Predicate
    );
    const data = rootERC20PredicateContract.interface.encodeFunctionData(
      'depositTo',
      [req.token, req.recipientAddress, req.depositAmount]
    );

    return {
      unsignedTx: {
        data: data,
        to: this.config.bridgeContracts.rootChainERC20Predicate,
        value: 0,
        from: req.depositorAddress,
      },
    };
  }
}

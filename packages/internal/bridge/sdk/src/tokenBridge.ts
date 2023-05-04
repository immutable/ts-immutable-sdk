import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import {
  BridgeDepositRequest,
  BridgeDepositResponse,
  BridgeFeeRequest,
  BridgeFeeResponse,
  FungibleToken,
} from 'types';
import RootERC20Predicate from 'contracts/ABIs/RootERC20Predicate.json';
import { BridgeError, BridgeErrorType, withBridgeError } from 'errors';

export class TokenBridge {
  private config: BridgeConfiguration;

  constructor(config: BridgeConfiguration) {
    this.config = config;
  }

  public async getFee(req: BridgeFeeRequest): Promise<BridgeFeeResponse> {
    if (!ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }
    return {
      bridgeable: true,
      feeAmount: await this.getFeeForToken(req.token),
    };
  }

  public async getUnsignedDepositTokenTx(
    req: BridgeDepositRequest,
  ): Promise<BridgeDepositResponse> {
    if (req.token === 'NATIVE') {
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR,
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    if (!ethers.utils.isAddress(req.recipientAddress)) {
      throw new BridgeError(
        `recipient address ${req.recipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS,
      );
    }

    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT,
      );
    }

    const depositor = ethers.utils.getAddress(req.depositorAddress);
    const receipient = ethers.utils.getAddress(req.recipientAddress);
    const token = ethers.utils.getAddress(req.token);

    const rootERC20PredicateContract = await withBridgeError<ethers.Contract>(
      async () => {
        const rootERC20PredicateContract = new ethers.Contract(
          this.config.bridgeContracts.rootChainERC20Predicate,
          RootERC20Predicate,
        );
        return rootERC20PredicateContract;
      },
      BridgeErrorType.INTERNAL_ERROR,
    );

    const data = await withBridgeError<string>(async () => rootERC20PredicateContract.interface.encodeFunctionData(
      'depositTo',
      [token, receipient, req.depositAmount],
    ), BridgeErrorType.INTERNAL_ERROR);

    return {
      unsignedTx: {
        data,
        to: this.config.bridgeContracts.rootChainERC20Predicate,
        value: 0,
        from: depositor,
      },
    };
  }

  private async getFeeForToken(
    token: FungibleToken,
  ): Promise<ethers.BigNumber> {
    return ethers.BigNumber.from(0);
  }
}
